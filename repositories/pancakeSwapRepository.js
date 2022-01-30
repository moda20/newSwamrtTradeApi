const store = require('../utils/dataStore');
const web3Utils = require('../bin/web3Utils');

module.exports = {
    getPairReserves: (pairAddress, {from, provider} = {})=>{
        if(!pairAddress) throw new Error("No pair address was provided");
        let contract =  new provider.web3.eth.Contract(store.readAbi('PSP'), web3Utils.CHK(pairAddress));
        return contract.methods.getReserves().call()
    },
    getPairAddress: (pairPath, {from, provider} = {}) => {
        if(!pairPath || pairPath?.length === 0) throw new Error("No pair address was provided");
        console.log(store.PancakeSwapFactoryContractAddress);
        let contract =  new provider.web3.eth.Contract(store.readAbi('PSF'), store.PancakeSwapFactoryContractAddress);
        return contract.methods.getPair(pairPath[0], pairPath[1]).call()
    },
    getCouplesFromPathList: (pathList = []) => {
        return pathList.map((e,i)=>{
            if(pathList.length === 2 && i >= 1){
                return null
            }
            if(e === (i+1 >= pathList.length ? pathList[0] : pathList[i+1])) return null;
            return [e, (i+1 >= pathList.length ? pathList[0] : pathList[i+1])]
        }).filter(e=>!!e)
    },
    getTaxesWithBNB: async ({tokenAddressList = [], web3, decimals, valueIn = 1000000000000000000}) => {
        const fees = [], errors = [];
        async function run(address) {
            await getMaxes(address);
            return await honeypotIs(address).then((res)=>{return res});
        }
        for (let token of tokenAddressList) {
            await run(token).then((res)=>{
                if(!res.error)
                    fees.push(res)
                else
                    errors.push(res)
            });
        }
    }
}
