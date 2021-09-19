const web3Utils = require('../bin/web3Utils');
const store  = require('../utils/dataStore');



module.exports.openAccount = async (req, res, next) =>{
    try{
        const addressToUnlock = req.body.owner ?? store.ownerAddress;
        let acc = await web3Utils.openAccount(addressToUnlock, store.ownerPassword);
        res.locals = {
            openUser:{
                address: addressToUnlock.toString()
            }
        }
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
        let acc = await web3Utils.lockAccount(addressToUnlock);
        return null;
    }catch(err){
        next(err);
    }
}
