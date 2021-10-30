const yaml = require('js-yaml');
const fs   = require('fs');

class EndpointResolver {
    static latestEndpoint;
    static currentNumber = 0;
    static execNodes = {};
    static allNodes = [];
    static mustExistNode = null;

    static readNodes(){
        try {
            const doc = yaml.load(fs.readFileSync(__dirname+"/../config/nodes.yml", 'utf8'));
            this.allNodes = doc?.rpcNodes ?? [];
            return this.allNodes;
        } catch (e) {
            console.log(e);
        }
    }

    static getMustExistEndpoint(){
        try{
            const doc = yaml.load(fs.readFileSync(__dirname+"/../config/nodes.yml", 'utf8'));
            this.mustExistNode = doc?.mustExistNode;
            return this.mustExistNode;
        }catch(e){
            console.log(e)
        }
    }

    static getEndpoint = (endpoints) => {
        let allNodes = endpoints ?? ( this.allNodes.length === 0 ? this.readNodes() : this.allNodes);
        this.currentNumber ++;
        console.log(allNodes);
        return allNodes[this.currentNumber%(allNodes.length)]
    }

    static getExecNodes = () => {
        const doc = yaml.load(fs.readFileSync(__dirname+"/../config/nodes.yml", 'utf8'));
        this.execNodes = doc?.exec_node;
        return this.execNodes;
    }
}

module.exports = EndpointResolver;
