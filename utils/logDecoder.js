const store = require('./dataStore');
const pairAbi = store.readAbi('PSP');
const routerAbi = store.readAbi('PSR');

module.exports = {
    decodeSingleLog(log, web3){
        let topics  = log.event ? log?.raw?.topics : log?.raw?.topics.splice(1);
        let decoded = web3.eth.abi.decodeLog(store.eventHashes[log?.raw?.topics[0]]?.inputs, log?.raw?.data.slice(2), topics);

        let getType = (name) => {
            return store.eventHashes[log?.raw?.topics[0]]?.inputs.filter((e)=>e.name === name)[0]
        }

        Object.keys(decoded).forEach((e)=>{
            if(getType(e)?.type === 'address'){
                decoded[`${e}Name`] = store.nameList?.[decoded[e]]?.name;
            }
        })
        return decoded;
    },

    getEventName(log){
        return store.eventHashes[log?.raw?.topics[0]]?.name
    }
}
