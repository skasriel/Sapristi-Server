/** Database */
var Sequelize = require('sequelize');


var pg = require('pg');
var pgURL = process.env.DATABASE_URL || "postgres://sapristi:changeme@localhost:5432/sapristi";
/*var client = new pg.Client(pgURL);
client.connect();*/

var sequelize = new Sequelize(pgURL, {dialect: 'postgres'});
console.log("Connected to "+pgURL);

module.exports.sequelize = sequelize;
