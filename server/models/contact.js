console.log("starting contact");

var Sequelize = require('sequelize');
var sequelize = require('../db.js').sequelize;
var User = require('./user');

var Contact = sequelize.define('Contact', {
  fromUser:         { type: Sequelize.STRING, references: User, referencesKey: "username"},
  toUser:           { type: Sequelize.STRING, references: User, referencesKey: "username"},
  connectionState:  { type: Sequelize.STRING}, //Sequelize.ENUM('INVITED', 'CONNECTED')
  displayName:      { type: Sequelize.STRING}
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


/*
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContactSchema = new Schema({
  id: {type: String, trim: true},
  displayName: {type: String, trim: true, required: true},
  birthday: Date,
  phoneNumbers: [{
    type: String,
    value: String,
    pref: String
  }]
  //phoneNumbers: [{type: Schema.ObjectId, ref: 'PhoneNumberSchema'}],
  //photos: [String], // TBD [Buffer] for images, [String] for URLs?
  //'defaultPhoto': photos[0],
  //'defaultPhoneNumber': phoneNumbers[0]
});
*/

/*var PhoneNumberSchema = new Schema({
  type:  {type: String, trim: true, required: true},
  value: {type: String, trim: true, required: true},
  pref:  {type: String, trim: true, required: true}
};
PhoneNumberSchema.path('value').index({ unique: true });
*/

/*
var photo = {
  'type': nativePhotos[k].type,
  'value': nativePhotos[k].value,
  'pref': nativePhotos[k].pref
};

module.exports = mongoose.model('Contact', ContactSchema);
module.exports.ContactSchema = ContactSchema;

//module.exports.PhoneNumberSchema = PhoneNumberSchema;
//module.exports.PhoneNumber = mongoose.model('PhoneNumber', PhoneNumberSchema);

console.log("registered Contact schema");
*/

///Tank.find({ size: 'small' }).where('createdDate').gt(oneYearAgo).exec(callback);
