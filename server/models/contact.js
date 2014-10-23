console.log("starting contact");

var Sequelize = require('sequelize');
var sequelize = require('../db.js').sequelize;
var User = require('./user');

var Contact = sequelize.define('Contact', {
  fromUser:         { type: Sequelize.STRING, references: User, referencesKey: "username", allowNull: false},
  toUser:           { type: Sequelize.STRING, references: User, referencesKey: "username", allowNull: false},
  connectionState:  { type: Sequelize.STRING, allowNull: false}, //Sequelize.ENUM('INVITED', 'CONNECTED')
  displayName:      { type: Sequelize.STRING, allowNull: false},
  desiredCallFrequency: {type: Sequelize.INTEGER, defaultValue: 0}
});

//Contact.drop();
//User.drop();



User.hasMany(Contact);
//User.hasMany(Contact, {foreignKey: 'fromUser', as: 'origination'});
//User.hasMany(Contact, {foreignKey: 'toUser', as: 'destination'});
//Contact.belongsTo(User, {foreignKey: 'username'});
Contact.belongsTo(User, {foreignKey: 'fromUser', as:'origin'});
Contact.belongsTo(User, {foreignKey: 'toUser', as:'destination'});



Contact.sync();

sequelize
  .sync(/*{ force: true }*/)
  .complete(function(err) {
     if (!!err) {
       console.error('An error occurred while creating the table:', err)
     } else {
       console.log('Sequelize.sync() complete')
     }
  });


Contact.StateEnum = {
  INVITED: 'INVITED',
  CONNECTED: 'CONNECTED'
};


module.exports = Contact;

console.log("registered contact schema");

