const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dryTokenPairs', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    trusted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    pair_address: {
      type: DataTypes.STRING(256),
      allowNull: true,
      unique: "pair_address"
    },
    pair_symbol: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    base_token_address: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    base_token_symbol: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    quote_token_address: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    quote_token_symbol: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    quote_token_pooled: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    base_token_pooled: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    last_block_number: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    failure_rate: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    last_update_time: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    base_token_decimals: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quote_token_decimals: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    update_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tokenPairsDryRun',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "pair_address",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pair_address" },
        ]
      },
    ]
  });
};
