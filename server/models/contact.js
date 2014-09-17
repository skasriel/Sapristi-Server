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
*/

module.exports = mongoose.model('Contact', ContactSchema);
module.exports.ContactSchema = ContactSchema;

//module.exports.PhoneNumberSchema = PhoneNumberSchema;
//module.exports.PhoneNumber = mongoose.model('PhoneNumber', PhoneNumberSchema);

console.log("registered Contact schema");


///Tank.find({ size: 'small' }).where('createdDate').gt(oneYearAgo).exec(callback);
