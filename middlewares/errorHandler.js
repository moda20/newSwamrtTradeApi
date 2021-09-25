const getRevertReason = require('eth-revert-reason')
const store = require('../utils/dataStore');
module.exports= async (err, req, res, next)=>{
    console.log(err);

    let status = 400;
    switch (err.message){
        case "EmptyResponse":
            status = 404;
            break;
    }
    let EVMError;
    /*if(err.receipt?.transactionHash){
        EVMError = await getRevertReason(err.receipt?.transactionHash, 'mainnet', err.receipt?.blockNumber, undefined)
    }*/

    res.status(status).json({
        "error": err.message,
        receipt: err.receipt,
        status: status,
        extraData: err.providerData,
        EVMError: EVMError ?? 'No error message found'
    })
}
