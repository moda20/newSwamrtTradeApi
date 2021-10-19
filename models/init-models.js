var DataTypes = require("sequelize").DataTypes;
var _testnetTokenPairs = require("./testnetTokenPairs");
var _tokenPairs = require("./tokenPairs");
var _tokenPairsDryRun = require("./dryTokenPairs");

function initModels(sequelize) {
  var testnetTokenPairs = _testnetTokenPairs(sequelize, DataTypes);
  var tokenPairs = _tokenPairs(sequelize, DataTypes);
  var tokenPairsDryRun = _tokenPairsDryRun(sequelize, DataTypes);


  return {
    testnetTokenPairs,
    tokenPairs,
    tokenPairsDryRun
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
