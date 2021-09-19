let instance;
const fs = require('fs');

class DataStore{

    constructor() {

        if(!instance){
            instance = this;
        }

        this.provider = process.env.SMART_TRADE_RPC_ENDPOINT;
        this.smartTradeContractAddress = process.env.SMART_TRADE_CONTRACT_ADDRESS;
        this.PancakeSwapRouterContractAddress = process.env.PANCAKE_ROUTER_CONTRACT_ADDRESS;
        this.PancakeSwapFactoryContractAddress ="";
        this.WBNBAddress = process.env.WBNB_CONTRACT_ADDRESS
        this.ownerAddress = process.env.OWNER_ACCOUNT_ACCOUNT
        this.ownerPassword = process.env.OWNER_ACCOUNT_PRIVATE_KEY_PASSWORD;
        return instance;
    }


    initialize(){
        this.setVariables({
            provider: process.env.SMART_TRADE_RPC_ENDPOINT,
            OwnerPassword:process.env.OWNER_ACCOUNT_PRIVATE_KEY_PASSWORD,
            OwnerAddress: process.env.OWNER_ACCOUNT_ACCOUNT,
            WBNBAddress: process.env.WBNB_CONTRACT_ADDRESS,
            PSRAddress: process.env.PANCAKE_ROUTER_CONTRACT_ADDRESS,
            smartTradeAddress: process.env.SMART_TRADE_CONTRACT_ADDRESS
        })
    }

    setVariables({provider, smartTradeAddress, PSRAddress, PSFAddress, WBNBAddress, OwnerAddress, OwnerPassword}){
        this.provider = provider;
        this.smartTradeContractAddress = smartTradeAddress;
        this.PancakeSwapRouterContractAddress = PSRAddress;
        this.PancakeSwapFactoryContractAddress =PSFAddress;
        this.WBNBAddress = WBNBAddress
        this.ownerAddress = OwnerAddress
        this.ownerPassword = OwnerPassword
    }

    _getAbiUrlFromName(name){
        switch(name){
            case "erc20":{
                return __dirname + '/../abis/erc20.json'
            }
            case "smartTrade":{
                return __dirname + '/../abis/smartTrade.json'
            }
            case "PSR":{
                return __dirname + '/../abis/PSR.json'
            }
            case "PSF":{
                return __dirname + '/../abis/PSF.json'
            }
            case "WBNB":{
                return __dirname + '/../abis/WBNB.json'
            }
        }
    }

    readAbi = (file = '') =>{
        console.log();
        return JSON.parse(fs.readFileSync(this._getAbiUrlFromName(file)).toString())
    }

}

module.exports = new DataStore();
