const web3Utils = require('../bin/web3Utils');
const middlewares = require('../middlewares/accountMiddleware');
const tokenControllers = require('../controllers/tokenController');
const store = require('../utils/dataStore')
const {pancakeSwap} = require('../repositories');

module.exports = function (router) {

    router.post('/SingleSwap', middlewares.openAccount, async (req, res, next) => {
        let earlyReserves = {};
        try {
            const {minimumAmountOut, amount, path, withFees, owner, deadline, toAddress, dryRun, seaparateSwaps} = req.body;
            const {address} = res.locals.openUser;
            if (dryRun) {
                await web3Utils.depositWBNB({
                    amount: amount ?? 0,
                    owner: owner ?? address,
                    provider: res.newProvider
                });
                if(path && path?.length !== 0){
                    let reserves = await Promise.all(pancakeSwap.getCouplesFromPathList(path).map(async (couple)=>{
                        let pairAddress = await pancakeSwap.getPairAddress(couple, {provider: res.newProvider});
                        return pancakeSwap.getPairReserves(pairAddress, {provider: res.newProvider}).then((reserves) => ({
                            reserves: {
                                reserve0: reserves._reserve0,
                                reserve1: reserves._reserve1,
                                timestamp: reserves._blockTimestampLast,
                                path: couple
                            },
                            pairAddress: pairAddress
                        }));
                    }));

                    earlyReserves = reserves.reduce((prev, curr) => {
                        prev[curr.pairAddress] = curr.reserves;
                        return prev;
                    }, {})
                }
            }
            if(seaparateSwaps){
                let dryPaths = pancakeSwap.getCouplesFromPathList(path);
                let nextStartingBalance = amount ?? 0;
                let txData = [];
                for (let i = 0; i < dryPaths.length; i++) {
                    let couples = dryPaths[i];
                    let transactionData = await web3Utils.swapBetween({
                        minimumAmountOut: minimumAmountOut ?? 0,
                        amountIn: nextStartingBalance,
                        owner: owner ?? address,
                        deadline: deadline ?? 5000,
                        path: couples ?? [],
                        toAddress: toAddress ?? owner ?? address,
                        withFees: withFees ?? false,
                        provider: res.newProvider
                    })
                    let newBalance = (await web3Utils.getBalanceOfToken({
                        provider: res.newProvider,
                        owner: owner ?? address,
                        tokenList: [couples[1]]
                    }));
                    nextStartingBalance = newBalance[couples[1]]?.['balance'];
                    txData.push(transactionData);
                }

                res.status(200).json({
                    ...txData,
                    earlyReserves
                });

                return next();

            }
            let transactionData = await web3Utils.swapBetween({
                minimumAmountOut: minimumAmountOut ?? 0,
                amountIn: amount ?? 0,
                owner: owner ?? address,
                deadline: deadline ?? 5000,
                path: path ?? [],
                toAddress: toAddress ?? owner ?? address,
                withFees: withFees ?? false,
                provider: res.newProvider
            })

            res.status(200).json({
                ...transactionData,
                earlyReserves
            });

            next();
        } catch (err) {
            err['providerData'] = {
                provider: res.newProvider.provider,
                earlyReserves
            }
            next(err)
        }
    }, middlewares.closeAccount);
};
