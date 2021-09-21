const { Sequelize, DataTypes, Model } = require('sequelize');
const initModels = require('../models/init-models');
let instance;


class dbConnect {

    constructor() {
        this.host = process.env.MYSQL_DB_HOST;
        this.port = process.env.MYSQL_DB_PORT;
        this.dbName = process.env.MYSQL_DB_DATABASE;
        this.password = process.env.MYSQL_DB_PASSWORD;
        this.user = process.env.MYSQL_DB_USER;

        if(!instance){
            this.models = initModels(this.connect());
            instance = this;
        }

        return instance;
    }


    connect(){
        let connectionString = `mysql://${this.user}:${this.password}@${this.host}:${this.port}/${this.dbName}`
        this.connection =  new Sequelize(connectionString)
        return this.connection;
    }


    initModels(){
        initModels(this.connection);
    }

}


module.exports = new dbConnect();
