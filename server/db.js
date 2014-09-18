var mongoose = require('mongoose');
var Sequelize = require('sequelize');


/** Database */
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
  // Create your schemas and models here.
  console.log("success");
});

var mongoURL = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/workplace_database';
console.log("Connecting to MongoDB on "+mongoURL);
mongoose.connect(mongoURL);


var pg = require('pg');
var pgURL = process.env.DATABASE_URL || "postgres://sapristi:changeme@localhost:5432/sapristi";
/*var client = new pg.Client(pgURL);
client.connect();*/

var sequelize = new Sequelize(pgURL, {dialect: 'postgres'});
console.log("Connected to "+pgURL);

/*
CREATE TYPE e_availability AS ENUM ('AVAILABLE', 'UNKNOWN', 'BUSY');
CREATE TYPE e_connectionState AS ENUM ('INVITED', 'CONNECTED');
CREATE TYPE e_userState AS ENUM ('GHOST', 'CREATED', 'CONFIRMED')
*/

module.exports.sequelize = sequelize;
