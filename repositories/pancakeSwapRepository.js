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
    }
}
