var DataTypes = require("sequelize").DataTypes;
var _testnetTokenPairs = require("./testnetTokenPairs");
var _tokenPairs = require("./tokenPairs");

function initModels(sequelize) {
  var testnetTokenPairs = _testnetTokenPairs(sequelize, DataTypes);
  var tokenPairs = _tokenPairs(sequelize, DataTypes);


  return {
    testnetTokenPairs,
    tokenPairs,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
