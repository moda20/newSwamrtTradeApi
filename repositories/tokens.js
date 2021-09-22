const {tokenPairs} = require('../bin/dbConnect').models;



module.exports ={
    getTrustedPairs: (limit, offset, {columns})=>{
        return tokenPairs.findAll({
            ...(columns ? {attributes: columns}: {}),
            where: {
                trusted: true
            },
            limit,
            offset
        });
    }
}

