const Web3 =require('web3');
const store = require('../utils/dataStore');

class web3Utils{



    constructor() {
        this.reloadWeb3AndContracts();
    }

    reloadWeb3AndContracts(){

        this.smartTradecontractAddress = store.smartTradeContractAddress;
        this.web3 = new Web3(new Web3.providers.HttpProvider(store.provider));
        this.PSRouterContract = new this.web3.eth.Contract(store.readAbi('PSR'), store.PancakeSwapRouterContractAddress, {gas: 20000000000});

    }

    CHK(address){
        return this.web3.utils.toChecksumAddress(address);
    }


    openAccount(address, password){
        return new Promise((res, rej)=>{
            this.web3.eth.personal.unlockAccount(this.CHK(address), password,0).then(res).catch(err=>rej(err));
        })
    }

    lockAccount(address){
        return new Promise((res, rej)=>{
            this.web3.eth.personal.lockAccount(this.CHK(address)).then(res).catch(rej);
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
            withFees = false
        }
      ){
        if(path?.length === 0) throw new Error('Empty Path given');

        const realDeadline = Math.ceil((new Date().getTime())/ 1000) + deadline;
        console.log(realDeadline);
        //approve
        let tokenContract = new this.web3.eth.Contract(store.readAbi('erc20'), path[0]);
        await tokenContract.methods.approve(this.CHK(store.PancakeSwapRouterContractAddress), amountIn).send({from: owner});
        let txHash;
        //swap
        if(withFees){
            txHash = await this.PSRouterContract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, minimumAmountOut, path, toAddress, realDeadline).send({
                from : owner
            })
        }else{
            txHash = await this.PSRouterContract.methods.swapExactTokensForTokens(amountIn, minimumAmountOut, path, toAddress, realDeadline).send({
                from : owner
            })
        }

        //let receipt = await this.web3.eth.getTransactionReceipt(txHash);
        let receipt = txHash;



        return {
            receipt,
            input:{
                amount: amountIn,
                minimumProfit: minimumAmountOut,
                path,
                withFees,
                owner,
                deadline: realDeadline,
                gasPrice: await this.web3.eth.getGasPrice()
            }
        }
    }


    async depositWBNB({amount, owner}){
        let tokenContract = new this.web3.eth.Contract(store.readAbi('WBNB'), store.WBNBAddress);
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
                gasPrice: await this.web3.eth.getGasPrice()
            }
        }
    }


    async getBalanceOfToken({owner, tokenList = []}){
       return await Promise.allSettled(tokenList.map(async (token)=>{
            let tokenContract =  new this.web3.eth.Contract(store.readAbi('erc20'), this.CHK(token));
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
