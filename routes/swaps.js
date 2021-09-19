const web3Utils = require('../bin/web3Utils');
const middlewares = require('../middlewares/accountMiddleware');


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
                withFees: withFees ?? false
            })

            res.status(200).json(transactionData);

            next();
        }catch (err){
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
            })

            res.status(200).json(transactionData);

            next();
        }catch (err){
            next(err)
        }
    }, middlewares.closeAccount)
};
