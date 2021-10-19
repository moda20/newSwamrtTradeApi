const web3Utils = require('../bin/web3Utils');
const middlewares = require('../middlewares/accountMiddleware');
const tokenControllers = require('../controllers/tokenController');

module.exports = function (router) {
    router.post('/SingleSwap', middlewares.openAccount, async (req, res, next)=>{
        try{
            const {minimumAmountOut, amount, path, withFees, owner, deadline, toAddress} = req.body;
            const {address} = res.locals.openUser;

            let transactionData = await web3Utils.swapBetween({
                minimumAmountOut: minimumAmountOut ?? 0,
                amountIn: amount ?? 0,
                owner: owner ?? address,
                deadline : deadline ?? 5000,
                path: path ?? [],
                toAddress: toAddress ?? owner ?? address,
                withFees: withFees ?? false,
                provider : res.newProvider
            })

            res.status(200).json(transactionData);

            next();
        }catch (err){
            err['providerData']={
                provider : res.newProvider.provider
            }
            next(err)
        }
    }, middlewares.closeAccount);


    router.post('/depositWBNB', middlewares.openAccount, async (req, res, next)=>{
        try{
            const {amount, owner} = req.body;
            const {address} = res.locals.openUser;

            let transactionData = await web3Utils.depositWBNB({
                amount: amount ?? 0,
                owner: owner ?? address,
                provider: res.newProvider
            })

            res.status(200).json(transactionData);

            next();
        }catch (err){
            next(err)
        }
    }, middlewares.closeAccount)

    router.post('/getBalance', middlewares.openAccount, async (req, res, next)=>{
        try{
            const {tokens, owner} = req.body;
            const {address} = res.locals.openUser;

            let transactionData = await web3Utils.getBalanceOfToken({
                tokenList: tokens ?? [],
                owner: owner ?? address,
                provider: res.newProvider
            })

            res.status(200).json(transactionData);

            next();
        }catch (err){
            next(err)
        }
    }, middlewares.closeAccount)

    router.post('/getAmountsOut', middlewares.getProvider, async (req, res, next)=>{
        try{
            const {amountIn, path} = req.body;
            if(!web3Utils.execEndpoint?.PSRouterContract) res.status(500).json({error:"Endpoint Not Found"})
            let transactionData = await (req.body.provider ? res.newProvider :web3Utils.execEndpoint?.PSRouterContract).methods.getAmountsOut(amountIn ?? 0, (path ?? []).map(e=>web3Utils.CHK(e)))
                .call();

            return res.status(200).json(transactionData);
        }catch (err){
            next(err)
        }
    })
    router.post('/getAmountsIn', middlewares.getProvider, async (req, res, next)=>{
        try{
            const {amountOut, path} = req.body;
            if(!web3Utils.execEndpoint?.PSRouterContract) res.status(500).json({error:"Endpoint Not Found"})
            let transactionData = await (req.body.provider ? res.newProvider :web3Utils.execEndpoint?.PSRouterContract).methods.getAmountsIn(amountOut ?? 0, (path ?? []).map(e=>web3Utils.CHK(e)))
                .call();

            return res.status(200).json(transactionData);
        }catch (err){
            next(err)
        }
    })


    router.post('/reserves', tokenControllers.readReserves);
};
