var express = require('express');
var router = express.Router();
const swapRouters = require('./swaps');

swapRouters(router);

module.exports = router;
