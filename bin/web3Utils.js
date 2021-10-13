const Web3 =require('web3');
const store = require('../utils/dataStore');
const logDecoder = require('../utils/logDecoder');
const endpointResolver = require('../bin/endpointResolver');


class web3Utils{

    multipleEndpoints= [];
    currentEndpointNumber = -1;
    inUserProviders = {};
    execEndpoint={}
    constructor() {
        this.populateWeb3Endpoints();
        this.reloadWeb3AndContracts();
        this.populateExecEndpoint();
    }

    populateExecEndpoint(){
        try{
            let execProvider = endpointResolver.getExecNodes().mainNet;
            let newWeb3 = new Web3(new Web3.providers.HttpProvider(execProvider));
            this.execEndpoint = {
                provider: execProvider,
                web3 : newWeb3,
                PSRouterContract: new newWeb3.eth.Contract(store.readAbi('PSR'), store.PancakeSwapRouterContractAddress, {gas: 20000000000})
            }
        }catch(e){
            console.log(e);
        }
    }

    populateWeb3Endpoints(){
        this.multipleEndpoints = endpointResolver.readNodes().map((e)=>{
            let newWeb3 = new Web3(new Web3.providers.HttpProvider(e));
           return {
               provider: e,
               web3 : newWeb3,
               PSRouterContract: new newWeb3.eth.Contract(store.readAbi('PSR'), store.PancakeSwapRouterContractAddress, {gas: 20000000000})
           }

        })
    }

    reloadWeb3AndContracts(){
        this.smartTradecontractAddress = store.smartTradeContractAddress;
        this.provider = endpointResolver.getEndpoint();
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.provider));
        this.PSRouterContract = new this.web3.eth.Contract(store.readAbi('PSR'), store.PancakeSwapRouterContractAddress, {gas: 20000000000});
    }

    CHK(address){
        return this.execEndpoint?.web3?.utils.toChecksumAddress(address) ?? address;
    }


    openAccount(address, password, provider){
        return new Promise((res, rej)=>{
            (provider ?? this).web3.eth.personal.unlockAccount(this.CHK(address), password,0).then(res).catch(err=>rej(err));
        })
    }

    lockAccount(address, provider){
        return new Promise((res, rej)=>{
            (provider ?? this).web3.eth.personal.lockAccount(this.CHK(address)).then(res).catch(rej);
        })
    }

    async swapBetween(
        {
            amountIn,
            minimumAmountOut = 0,
            path,
            deadline = 5000,
            toAddress,
            owner,
            withFees = false,
            provider
        }
      ){

        let myProvider = provider
        console.log(`will use the following provider : ${myProvider.provider}`)
        if(path?.length === 0) throw new Error('Empty Path given');

        const realDeadline = Math.ceil((new Date().getTime())/ 1000) + deadline;
        console.log(realDeadline);
        //approve
        let tokenContract = new myProvider.web3.eth.Contract(store.readAbi('erc20'), path[0]);
        console.log(myProvider.web3.currentProvider?.host)
        await tokenContract.methods.approve(this.CHK(store.PancakeSwapRouterContractAddress), amountIn).send({from: owner});
        let txHash;
        //swap
        if(withFees){
            txHash = await myProvider.PSRouterContract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, minimumAmountOut, path, toAddress, realDeadline).send({
                from : owner
            })
        }else{
            txHash = await myProvider.PSRouterContract.methods.swapExactTokensForTokens(amountIn, minimumAmountOut, path, toAddress, realDeadline).send({
                from : owner
            })
        }

        //let receipt = await this.web3.eth.getTransactionReceipt(txHash);
        let receipt = txHash;

        try{
            receipt.logs = Object.values(receipt?.events)?.map((e)=>{
                return {
                    ...e,
                    ['decodedLogs'] : logDecoder.decodeSingleLog(e, this.web3),
                    ['eventName']: logDecoder.getEventName(e),
                    raw: undefined
                }
            })

            delete  receipt?.events;
        }catch (e){
            console.log(e);
        }

        this.inUserProviders[myProvider.provider] = false;

        return {
            receipt,
            input:{
                amount: amountIn,
                minimumProfit: minimumAmountOut,
                path,
                withFees,
                owner,
                deadline: realDeadline,
                gasPrice: await this.web3.eth.getGasPrice(),
                provider: myProvider.provider
            }
        }
    }


    async depositWBNB({amount, owner, provider}){

        let myProvider = provider;

        let tokenContract = new myProvider.web3.eth.Contract(store.readAbi('WBNB'), store.WBNBAddress);
        //deposit
        let txHash = await tokenContract.methods.deposit().send({
            from: owner,
            value: amount
        })
        let receipt = txHash;
        return {
            receipt,
            input:{
                amount: amount,
                owner,
                gasPrice: await this.web3.eth.getGasPrice(),
                provider: myProvider.provider
            }
        }
    }


    async getBalanceOfToken({owner, tokenList = [], provider}){
       return await Promise.allSettled(tokenList.map(async (token)=>{
            let tokenContract =  new provider.web3.eth.Contract(store.readAbi('erc20'), this.CHK(token));
            let balance = await tokenContract.methods.balanceOf(owner).call();
            return {
                [token]: {
                    balance: balance.toString()
                }
            }
        })).then((dataArray)=>dataArray.reduce((p,c)=>{
            return {...p, ...c.value}
        },{}))
    }


}


module.exports = new web3Utils();
