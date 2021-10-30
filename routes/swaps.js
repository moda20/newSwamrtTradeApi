const web3Utils = require('../bin/web3Utils');
const middlewares = require('../middlewares/accountMiddleware');
const tokenControllers = require('../controllers/tokenController');
const store = require('../utils/dataStore')

module.exports = function (router) {
    router.post('/SingleSwap', middlewares.openAccount, async (req, res, next) => {
        try {
            const {minimumAmountOut, amount, path, withFees, owner, deadline, toAddress, dryRun} = req.body;
            const {address} = res.locals.openUser;
            if (dryRun) {
                await web3Utils.depositWBNB({
                    amount: amount ?? 0,
                    owner: owner ?? address,
                    provider: res.newProvider
                })
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

            res.status(200).json(transactionData);

            next();
        } catch (err) {
            err['providerData'] = {
                provider: res.newProvider.provider
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
                })
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

            res.status(200).json(transactionData);

            next();
        } catch (err) {
            err['providerData'] = {
                provider: res.newProvider.provider
            }
            next(err)
        }
    }, middlewares.closeAccount)

    router.post('/reserves', tokenControllers.readReserves);
};
