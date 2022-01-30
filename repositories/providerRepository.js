const ganache = require("ganache-core");
const ganacheAlpha = require("ganache");
const store = require('../utils/dataStore');
const web3 = require("web3");



module.exports={
    createNewDryProvider: ({blockNumber, unlockedAddresses= []}) => {
        console.log(process.env.SOURCE_CHAIN_RPC_ENDPOINT);
        const options = {
            accounts:[
                {
                    secretKey: "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
                    balance: "0x84595161401484A000000"
                }
            ],
            fork:`${process.env.SOURCE_CHAIN_RPC_ENDPOINT}${blockNumber?'@'+blockNumber: ''}`,
            unlocked_accounts:[...(unlockedAddresses ?? []), store.smartTradeOwnerAddress],
            gasLimit: 80000000000,
            default_balance_ether: 1000000000000,
            port:8999
        };
        const provider = ganacheAlpha.provider(options);
        return new web3(provider);
    }
}
