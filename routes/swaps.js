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


    router.post('/depositWBNB', middlewares.openAccount, async (req, res, next) => {
        try {
            const {amount, owner} = req.body;
            const {address} = res.locals.openUser;

            let transactionData = await web3Utils.depositWBNB({
                amount: amount ?? 0,
                owner: owner ?? address,
                provider: res.newProvider
            })

            res.status(200).json(transactionData);

            next();
        } catch (err) {
            next(err)
        }
    }, middlewares.closeAccount)

    router.post('/getBalance', middlewares.openAccount, async (req, res, next) => {
        try {
            const {tokens, owner} = req.body;
            const {address} = res.locals.openUser;

            let transactionData = await web3Utils.getBalanceOfToken({
                tokenList: tokens ?? [],
                owner: owner ?? address,
                provider: res.newProvider
            })

            res.status(200).json(transactionData);

            next();
        } catch (err) {
            next(err)
        }
    }, middlewares.closeAccount)

    router.post('/getAmountsOut', middlewares.getProvider, async (req, res, next) => {
        try {
            const {amountIn, path} = req.body;
            if (!web3Utils.execEndpoint?.PSRouterContract) res.status(500).json({error: "Endpoint Not Found"})
            let transactionData = await (req.body.provider ? res.newProvider : web3Utils.execEndpoint?.PSRouterContract).methods.getAmountsOut(amountIn ?? 0, (path ?? []).map(e => web3Utils.CHK(e)))
                .call();

            return res.status(200).json(transactionData);
        } catch (err) {
            next(err)
        }
    })
    router.post('/getAmountsIn', middlewares.getProvider, async (req, res, next) => {
        try {
            const {amountOut, path} = req.body;
            if (!web3Utils.execEndpoint?.PSRouterContract) res.status(500).json({error: "Endpoint Not Found"})
            let transactionData = await (req.body.provider ? res.newProvider : web3Utils.execEndpoint?.PSRouterContract).methods.getAmountsIn(amountOut ?? 0, (path ?? []).map(e => web3Utils.CHK(e)))
                .call();

            return res.status(200).json(transactionData);
        } catch (err) {
            next(err)
        }
    })

    router.post('/dryExecute', middlewares.openAccount, async (req, res, next) => {
        let earlyReserves = {};
        try {
            const {
                bnbAmount,
                pairA,
                desiredMinimumFinalAmount,
                pairB,
                pairC,
                minimumProfitNeeded,
                swapType,
                isTesting,
                noTransaction,
                testPredict,
                tokenPath,
                gasPrice,
                gasAmount,
                owner,
                nonce,
                initialGasCost,
                dryRun
            } = req.body;

            const {address} = res.locals.openUser;
            if(owner && web3Utils.CHK(owner) !== web3Utils.CHK(address)){}
            if (dryRun) {
                await web3Utils.depositWBNB({
                    amount: bnbAmount ?? 0,
                    owner: owner ?? address,
                    provider: res.newProvider
                });

                if(tokenPath && tokenPath?.length !== 0){
                    let reserves = await Promise.all(tokenPath.map((e,i)=>{
                        if(tokenPath.length === 2 && i >= 1){
                            return null
                        }
                        if(e === (i+1 >= tokenPath.length ? tokenPath[0] : tokenPath[i+1])) return null;
                        return [e, (i+1 >= tokenPath.length ? tokenPath[0] : tokenPath[i+1])]
                    }).filter(e=>!!e).map(async (couple)=>{
                        let pairAddress = await pancakeSwap.getPairAddress(couple, {provider: res.newProvider});
                        return pancakeSwap.getPairReserves(pairAddress, {provider: res.newProvider}).then((reserves) => ({
                            reserves: {
                                reserve0: reserves._reserve0,
                                reserve1: reserves._reserve1,
                                timestamp: reserves._blockTimestampLast,
                                tokenPath: couple
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
            let fundingReceipt = await web3Utils.transferETH({owner: address, to:store.smartTradeOwnerAddress, provider: res.newProvider });
            let transactionData = await web3Utils.executeSwaps(
                {
                    bnbAmount,
                    pairA,
                    desiredMinimumFinalAmount : desiredMinimumFinalAmount ?? bnbAmount,
                    pairB,
                    pairC,
                    minimumProfitNeeded: minimumProfitNeeded ?? 0,
                    swapType: swapType ?? 1,
                    isTesting,
                    noTransaction,
                    testPredict,
                    tokenPath: tokenPath ?? [],
                    gasPrice: gasPrice ?? res.newProvider.web3.utils.toWei('5', 'gwei'),
                    gasAmount : gasAmount ?? 8000000,
                    owner: owner ?? store.smartTradeOwnerAddress,
                    nonce : nonce ?? await res.newProvider.web3.eth.getTransactionCount(owner ?? store.smartTradeOwnerAddress),
                    initialGasCost: initialGasCost ?? 0,
                    provider: res.newProvider,
                }
            )

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
    }, middlewares.closeAccount)

    router.post('/reserves', tokenControllers.readReserves);
};
