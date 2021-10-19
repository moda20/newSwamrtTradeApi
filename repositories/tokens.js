const {tokenPairs, tokenPairsDryRun} = require('../bin/dbConnect').models;

module.exports ={
    getTrustedPairs: (limit, offset, {columns} = {})=>{
        return tokenPairs.findAll({
            ...(columns ? {attributes: columns}: {}),
            where: {
                trusted: true
            },
            limit,
            offset
        });
    },
    getTrustedPairsOfDryRunDatabase: (limit, offset, {columns} = {})=>{
        return tokenPairsDryRun.findAll({
            ...(columns ? {attributes: columns}: {}),
            where: {
                trusted: true
            },
            limit,
            offset
        });
    }
}

