const tokenRepository = require('../repositories/tokens');

module.exports = {
    readReserves: async (req, res, next) => {
        const {dry} = req.body;
        try{
            let dataSet = dry ? await tokenRepository.getTrustedPairsOfDryRunDatabase() : await tokenRepository.getTrustedPairs();
            let dataSetParsed = dataSet.map((e) => (
                {
                    'new': true,
                    'pair': `${e?.base_token_symbol},${e?.base_token_address}/${e?.quote_token_symbol},${e?.quote_token_address}`,
                    'pairAddress': e?.pair_address ?? null,
                    'data': {
                        BlockNumber: e?.last_block_number ?? null,
                        tokenOne: e?.base_token_pooled ?? null,
                        tokenTwo: e?.quote_token_pooled ?? null
                    },
                    'meta': {
                        't': new Date().getTime(),
                        'ws': false,
                        'db': true,
                        'rp': e.update_count ?? 0,
                        'fl': e?.failure_rate ?? 0,
                        'readingTimeStamp': 0,
                        'blockNumber': e?.last_block_number ?? null,
                        'delay': 0,
                        "tokenInfo": {
                            'b_adr': e?.base_token_address,
                            'q_adr': e?.quote_token_address,
                            [e?.base_token_address ?? "TokenOneData"]: {
                                'decimals': e?.base_token_decimals
                            },
                            [e?.quote_token_address ?? "TokenTwoData"]: {
                                'decimals': e?.quote_token_decimals
                            },
                        },
                    },
                }
            ));
            res.status(200).json(dataSetParsed);
        }catch(e){
            next(e);
        }
    }
}
