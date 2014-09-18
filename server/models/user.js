var PassportLocalStrategy = require('passport-local').Strategy;
var Sequelize = require('sequelize');
var sequelize = require('../db.js').sequelize;

var crypto = require('crypto');


var User = sequelize.define('User', {
  username:     { type: Sequelize.STRING, primaryKey: true},
	hashedPassword: { type: Sequelize.STRING},
	salt:         { type: Sequelize.STRING},
  //password:     { type: Sequelize.STRING},
  mobileNumber: { type: Sequelize.STRING},
  authToken:    { type: Sequelize.STRING},
  availability: { type: Sequelize.STRING}, //Sequelize.ENUM('AVAILABLE', 'UNKNOWN', 'BUSY')},
  birthday:     { type: Sequelize.DATE},
  userState:    { type: Sequelize.STRING} //type: Sequelize.ENUM('GHOST', 'CREATED', 'CONFIRMED')}
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
//User.drop();
User.sync();

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


/*var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');


var UserSchema = new Schema({
  displayname: {type: String, trim: true},
  mobileNumber: {type: String, trim: true, required: true},
  contacts: [{type: Schema.ObjectId, ref: 'ContactSchema'}]  // array of contacts (all addressbook contacts)
  // array of friends (subset of contacts which the user has selected as friends)
});


UserSchema.plugin(passportLocalMongoose);
UserSchema.path('username').index({unique: true});
UserSchema.path('mobileNumber').index({unique: true}); */

module.exports = User; // mongoose.model('User', UserSchema);
//module.exports.UserSchema = UserSchema;

console.log("registered user schema");
