var mongoose = require('mongoose'),
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
UserSchema.path('mobileNumber').index({unique: true});
module.exports = mongoose.model('User', UserSchema);
module.exports.UserSchema = UserSchema;

console.log("registered user schema");
