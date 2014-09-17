/* Routes related to friends */

var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Contact = require('../models/contact');


function IsAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
      next();
  } else {
    res.status(401);
    res.send(401);
    console.log("Not authorized "+req);
    next(new Error(401));
  }
}

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

function sendRegisteredUsersFromContactList(req, res, allPhoneNumbers) {
  //var allPhoneNumbers =
  User.find({mobileNumber: {"$in": allPhoneNumbers}}).exec(function(err, registeredNumbers) {
    if (err) {
      return console.error("Cannot execute sendRegisteredUsersFromContactList "+err)
    }
    console.log("Found the following registered users: "+JSON.stringify(registeredNumbers));
    return res.send(registeredNumbers);
  });
}

/**
* POST list of iPhone contacts to be stored in mongo
* Returns the subset of the list that corresponds to a Sapristi user
*/
router.post('/', IsAuthenticated, function (req, res) {
  console.log("in POST /api/contacts. Active user is: "+req.user.username);

  User.findOne({'username' : req.user.username}).exec(function (err, activeUser) {
    if (err) {
      return console.error("Error accessing user: "+req.user.username+" = "+err);
    }
    var contactList = req.body.contacts;
    console.log("Found user: "+JSON.stringify(activeUser)+" and contacts: "+JSON.stringify(contactList));
    var contacts = new Array();
    var allPhoneNumbers = new Array(); // store all phone numbers directly, to then return the subset that is mapped to registered users
    var numSaved = 0;
    // need to replace this with a batch insert (hundreds of contacts per user...)
    while(activeUser.contacts.length>0) // empty the current list of contacts before uploading the new one (not the best way to merge...)
      activeUser.contacts.pop();

    for (var i=0; i<contactList.length; i++) {
      console.log("Creating contact #"+i+" "+contactList[i].displayName);
      var phoneNumbers = new Array();
      for (var j=0; j<contactList[i].phoneNumbers.length; j++) {
        var phoneNumber = contactList[i].phoneNumbers[j];
        phoneNumbers.push({
          'type': phoneNumber.type,
          'value': phoneNumber.value,
          'pref': phoneNumber.pref
        });
        allPhoneNumbers.push(phoneNumber.value);
      }
      var contact = new Contact({
        'id': contactList[i].id,
        'displayName': contactList[i].displayName,
        'phoneNumbers': phoneNumbers,
        //'photos': contactList[i].photos,
        'birthday': contactList[i].birthday
      });
      contact.save(function(err) {
        if (err) { // ...
          console.error('Error saving contact: '+JSON.stringify(contactList[i])+" err = "+err);
        } else {
          activeUser.contacts.push(contact);
        }
        numSaved++;
        if (numSaved==contactList.length) {
          console.log("Saved all contacts, now adding to user");
          activeUser.save(function(err) {
            if (err) {
              console.error('Error saving contacts for user: '+activeUser+" err="+err);
            } else {
              sendRegisteredUsersFromContactList(req, res, allPhoneNumbers);
            }
          });
        }
      });
    }
  });
});

module.exports = router;
