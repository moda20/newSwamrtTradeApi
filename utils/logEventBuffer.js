const dbConnect = require('../bin/dbConnect');
const tokenRepo = require('../repositories/tokens');
const datastore = require('./dataStore');
const web3Utils = require('../bin/web3Utils');

hashAbi = (eventAbi) =>{
    let eventName = eventAbi['name'];
    let nameList = [];
    let hashList = [];
    let indexedItems = [];
    let hasIndexed = false;

    for (let input of eventAbi['inputs']){
        nameList.push({
            'name':input['name'],
            'indexed': input['indexed'],
            'type': input['type'],
        })
        hashList.push(input['type'])
        if (input['indexed']){
            hasIndexed = true
            indexedItems.push(input['name'])
        }
    }

    return {
        hash: web3Utils.web3.utils.keccak256(`${eventName}(${hashList.join(',')})`),
        nameList,
        eventName,
        hashList,
        hasIndexed,
        indexedItems
    }
}


module.exports.readBuffer = ()=>{

    console.log("will read the buffer");
    const pairAbi = datastore.readAbi('PSP');
    const routerAbi = datastore.readAbi('PSR');
    const smartTrade = datastore.readAbi('smartTrade');
    const WBNB = datastore.readAbi('WBNB');
    let pairAbiEvents = pairAbi.filter((e)=>e.type==='event');
    let routerAbiEvents = routerAbi.filter((e)=>e.type==='event');
    let smartTradeEvents = smartTrade.filter((e)=>e.type==='event');
    let WBNBEvents = WBNB.filter((e)=>e.type==='event');

    datastore.setToStore('eventHashes',{
        ...(datastore['eventHashes'] ?? {}),
        ...pairAbiEvents.map((e)=>{
            return {
                [hashAbi(e).hash]: e
            }
        }).reduce((p, c)=>{return {...p, ...c}}, {}),
        ...routerAbiEvents.map((e)=>{
            return {
                [hashAbi(e).hash]: e
            }
        }).reduce((p, c)=>{return {...p, ...c}}, {}),
        ...smartTradeEvents.map((e)=>{
            return {
                [hashAbi(e).hash]: e
            }
        }).reduce((p, c)=>{return {...p, ...c}}, {}),
        ...WBNBEvents.map((e)=>{
            return {
                [hashAbi(e).hash]: e
            }
        }).reduce((p, c)=>{return {...p, ...c}}, {}),

    })

    console.log("buffer read correctly","read ", pairAbiEvents.length + routerAbiEvents.length +smartTradeEvents.length + WBNBEvents.length);



   /* tokenRepo.getTrustedPairs().then((pairs)=>{

    })*/
}
