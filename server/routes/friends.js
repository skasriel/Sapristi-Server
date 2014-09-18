/* Routes related to friends */

var express = require('express');
var router = express.Router();
var auth = require('./auth');

/** Returns a mongoose promise that can be exec()
*/
/*app.getRoomByNameOrId = function(name) {
  if ((typeof name == 'string' || name instanceof String) && name.charAt(0)=='@') {
    console.log("Finding 1:1 room: "+name);
    // this is a 1:1 room, which may not have been created yet since they are created upon the first message being sent
    return Workroom.findOne({'name': name}); //name: name
  } else {
    return Workroom.findById(name);
  }
}*/

/**
* Get friend list
*/
router.get('/', auth.isAuthenticated, function (req, res) {
  console.log("in /api/friends ");
  var friends = new Array();
  friends.push({
    "id": 0,
    "displayName": "Gwen",
    "defaultPhoneNumber": "+1-650-319-5424",
    "defaultPhoto": "avatars/gwen.jpg"
  });

  friends.push({
    "id": 0,
    "displayName": "Ced",
    "defaultPhoneNumber": "+1-408-506-0781",
    "defaultPhoto": "avatars/ced.jpg"
  });
  /*
  'id': nativeContact.id,
  'displayName': nativeContact.displayName,
  'phoneNumbers': phoneNumbers,
  'photos': photos,
  'birthday': nativeContact.birthday,
  'defaultPhoto': photos[0],
  'defaultPhoneNumber': phoneNumbers[0]*/

  console.log("returning: "+friends);
  res.send(friends);
});

module.exports = router;
