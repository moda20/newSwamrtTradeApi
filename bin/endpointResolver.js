const yaml = require('js-yaml');
const fs   = require('fs');

class EndpointResolver {
    static latestEndpoint;
    static currentNumber = 0;

    static allNodes = []

    static readNodes(){
        try {
            const doc = yaml.load(fs.readFileSync(__dirname+"/../config/nodes.yml", 'utf8'));
            this.allNodes = doc?.rpcNodes ?? [];
            return this.allNodes;
        } catch (e) {
            console.log(e);
        }
    }


    static getEndpoint = () => {
        let allNodes = this.allNodes.length === 0 ? this.readNodes() : this.allNodes;
        this.currentNumber ++;
        console.log(allNodes[this.currentNumber%(allNodes.length)]);
        console.log(allNodes);
        return allNodes[this.currentNumber%(allNodes.length)]
    }
}

module.exports = EndpointResolver;
