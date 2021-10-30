const web3Utils = require('../bin/web3Utils');
const store  = require('../utils/dataStore');
const providerRepository = require('../repositories/providerRepository');

module.exports.getProvider = async (req, res, next) => {
    try{
        res.newProvider = Object.values(web3Utils.multipleEndpoints)[req.body.provider ?? 0];
        next();
    }catch(err){
        console.log(err);
        if(err?.constructor !== 'Error'){
            err = new Error(err)
        }
        next(err)
    }
}

module.exports.openAccount = async (req, res, next) =>{
    try{
        const addressToUnlock = req.body.owner ?? store.ownerAddress;
        let myProvider
        if(req.body.dryRun){
            let newWeb3 = providerRepository.createNewDryProvider({
                blockNumber: req.body.blockNumber,
                unlockedAddresses: req.body.unlockedAddresses});
            myProvider = {
                web3 : newWeb3,
                provider: "ganache dry run",
                PSRouterContract: new newWeb3.eth.Contract(store.readAbi('PSR'), store.PancakeSwapRouterContractAddress, {gas: 20000000000})
            }
        }else{
            myProvider = Object.values(web3Utils.multipleEndpoints)[req.body.provider ?? 0];
        }
        let acc = await web3Utils.openAccount(addressToUnlock, store.ownerPassword, myProvider);
        res.locals = {
            openUser:{
                address: addressToUnlock.toString()
            }
        }
        res.newProvider = myProvider;
        next();
    }catch(err){
        console.log(err);
        if(err?.constructor !== 'Error'){
            err = new Error(err)
        }
        next(err)
    }
}



module.exports.closeAccount = async (req, res, next) =>{
    try{
        const addressToUnlock = req.body.owner ?? res.locals['openUser']?.address;
        let newProvider = res.newProvider;
        let acc = await web3Utils.lockAccount(addressToUnlock, newProvider);
        return null;
    }catch(err){
        next(err);
    }
}
