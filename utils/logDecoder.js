const store = require('./dataStore');
const pairAbi = store.readAbi('PSP');
const routerAbi = store.readAbi('PSR');

module.exports = {
    decodeSingleLog(log, web3){
        let topics  = log.event ? log?.raw?.topics : log?.raw?.topics.splice(1)
        return web3.eth.abi.decodeLog(store.eventHashes[log?.raw?.topics[0]]?.inputs, log?.raw?.data.slice(2), topics)
    }
}
