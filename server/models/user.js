console.log("starting user");

var PassportLocalStrategy = require('passport-local').Strategy;
var Sequelize = require('sequelize');
var sequelize = require('../db.js').sequelize;
var PhoneFormat = require('../PhoneFormat');

var crypto = require('crypto');


var User = sequelize.define('User', {
  username:     { type: Sequelize.STRING, primaryKey: true},
	hashedPassword: { type: Sequelize.STRING},
	salt:         { type: Sequelize.STRING},
  mobileNumber: { type: Sequelize.STRING}, // e164 formatted number
  rawMobileNumber: {type: Sequelize.STRING}, // number as entered in user's address book
  authToken:    { type: Sequelize.STRING},
  availability: { type: Sequelize.STRING}, //Sequelize.ENUM('AVAILABLE', 'UNKNOWN', 'BUSY')},
  reason:       { type: Sequelize.STRING}, 
  birthday:     { type: Sequelize.DATE},
  userState:    { type: Sequelize.STRING}, //type: Sequelize.ENUM('GHOST', 'CREATED', 'CONFIRMED')}
  apnToken:     { type: Sequelize.STRING}, // opaque identifier sent by iOS devices for push notifications
},
{
	instanceMethods: {
    makeSalt: function() {
				return crypto.randomBytes(16).toString('base64');
		},
		authenticate: function(plainText){
			return this.encryptPassword(plainText, this.salt) === this.hashedPassword;
		},
		encryptPassword: function(password, salt) {
			if (!password || !salt) return '';
			salt = new Buffer(salt, 'base64');
			return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
		}
	}
}
);

User.sync();

User.Country = {
  US: 'US'
}


User.normalize = function(phoneNumber, referenceCountry) {
  return PhoneFormat.formatE164(User.Country.US, phoneNumber); // Hack: not handling international phone numbers at all, need to fix...
}

User.UserStateEnum = {
  GHOST: 'GHOST',
  CREATED: 'CREATED',
  CONFIRMED: 'CONFIRMED'
};

User.AvailabilityEnum = {
  AVAILABLE: 'AVAILABLE',
  UNKNOWN: 'UNKNOWN',
  BUSY: 'BUSY'
};

User.ReasonEnum = {

};


module.exports = User;

console.log("registered user schema");
