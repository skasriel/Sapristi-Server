/* Routes related to me */
var Logger = require('../Logger');
var logger = Logger.get(Logger.ME);


var async = require('async');

var express = require('express');
var router = express.Router();

var passport = require('passport'),
    auth = require('./auth'),
    Sequelize = require('sequelize'),
    User = require('../models/user'),
    Contact = require('../models/contact');
var notificationManager = require('../NotificationManager');

var auth = require('./auth');

var apn = require('apn');

var redis = require('../redis');


function getRedisKey(username) {
  return "user:"+username+":availability";
}


/** 
* Retrieve my availability
*/
router.get('/availability', auth.isAuthenticated, function(req, res) {
  var user = req.user;
  var username = user.username;
  var reason = user.reason;
  var availability = user.availability;

  // the redis look up is actually useless at this stage given that Passport currently always looks up the user from the DB for each request...
  /*redis.client.get(getRedisKey(username), function(err, availability) {
    if (!err & availability) {
      sendAvailability(req, res, availability);
      return;
    }*/
    sendAvailability(req, res, availability, reason);
  //});
});

function sendAvailability(req, res, availability, reason) {
  res.status(200);
  var response = {"availability": availability};
  if (reason) response["reason"] = reason;
  logger.log("Availability: "+availability+" reason: "+reason);
  res.send(response);
}

/**
 * Toggle my availability busy / unknown / available
 * And notify those who have friended me about this update
 */
router.post('/availability',  auth.isAuthenticated, function(req, res) {
  var newAvailability = req.body.availability;
  var reason = req.body.reason;
  var user = req.user;

  updateAvailability(req, res, user, newAvailability, reason);
});

function updateAvailability(req, res, user, newAvailability, reason) {
  logger.log("Updating availability for "+user.username+" to "+newAvailability+" reason="+reason);

  user.reason = reason; // store the reason in the User table

  switch(newAvailability) {
    case User.AvailabilityEnum.AVAILABLE:
    case User.AvailabilityEnum.UNKNOWN:
    case User.AvailabilityEnum.BUSY:
      user.availability = newAvailability;
      break;
    default:
      user.availability = User.AvailabilityEnum.UNKNOWN;
      logger.log("Unknown availability: "+newAvailability+" setting to UNKNOWN instead");
  }

  // Change availability in database
  user.save().error(function(error) {
    logger.log("Unable to change availability for "+user.username+" because of error: "+error);
    res.status(401);
    return res.send(401);
  })
  .success(function() {
    res.status(200);
    notificationManager.sendAvailabilityPushNotifications(user);     // now notify all relevant users
    redis.client.set("user:"+user.username+":availability", user.availability, redis.print); // keep the redis cache in sync
    var response = {
        "availability": newAvailability,
        "reason": reason
      };
    res.send(response);
  });
}



/**
 * Updates the user's current motion type. Either old or new type will be CarMotionType
 */
var MotionTypeNotMoving = 1; // See SKMotionDetector.swift
var MotionTypeWalking = 2;
var MotionTypeRunning = 3;
var MotionTypeDriving = 4;
router.post('/motion',  auth.isAuthenticated, function(req, res) {
  var user = req.user;
  var oldMotionType = req.body.oldMotionType;
  var newMotionType = req.body.newMotionType;
  if ((oldMotionType!=MotionTypeDriving && newMotionType!=MotionTypeDriving) || (oldMotionType==newMotionType)) {
    logger.error("Incorrect motion type update: "+oldMotionType+" -> "+newMotionType+" for user "+req.user.username);
    return;
  }
  /*
  // Don't switch back & forth too fast, e.g. because user is at a traffic light
  // this simple logic doesn't work though - because client will only send updates once for each transition from driving to not-driving 
  // or vice versa so an ignored message here will result in incorrect state until the next client update.
  var now = new Date();
  var lastUpdate = user.updatedAt; 
  var timeSinceLastUpdateMillis = now - lastUpdate;
  if (timeSinceLastUpdateMillis < 1000*60*5) { // don't update more often than every few minutes to avoid being annoying to others 
    logger.log("Ignoring motion update because it's happening too quickly after the last update: "+timeSinceLastUpdateMillis);
    return;
  }*/

  logger.log("Updating Motion Type for "+req.user.username+" from "+oldMotionType+" to "+newMotionType);
  var newAvailability, newReason;
  if (newMotionType == MotionTypeDriving) {
    newAvailability = User.AvailabilityEnum.AVAILABLE;
    newReason = User.ReasonEnum.CarMotion;
  } else {
    // Logic to re-compute the user's availability after she stopped driving... TODO...
    newAvailability = User.AvailabilityEnum.UNKNOWN;
    newReason = User.ReasonEnum.CarMotion;    
  }
  updateAvailability(req, res, user, newAvailability, newReason);
});


/**
 * Creates or updates the APN token for this user (used to send push notifications to iOS device)
 */
router.post('/apn-token',  auth.isAuthenticated, function(req, res) {
  var apnToken = req.body.apnToken;
  var user = req.user;
  logger.log("Updating APN Token for "+req.user.username+" to "+apnToken);
  user.apnToken = apnToken;

  // Save to database
  user.save().error(function(error) {
    logger.log("Unable to change APN token for "+user.username+" because of error: "+error);
    res.status(401);
    return res.send(401);
  })
  .success(function() {
    res.status(200);
    redis.client.set("user:"+user.username+":apnToken", user.apnToken, redis.print); // keep the redis cache in sync
    res.send(auth.OK);
  });
});


/** 
 * Updates the friend's desiredCallFrequency
 */
 router.post('/desired-frequency/:friend',  auth.isAuthenticated, function(req, res) {
  var user = req.user;
  var friend = req.params.friend;
  var newFrequency = req.body.newFrequency
  logger.log("Updating desiredFrequency for friend"+friend+" of user "+req.user.username+" to "+newFrequency);
  Contact.find({fromUser: user.username, toUser: friend}
    ).error(function(error) {
    logger.log("error finding connection entry "+user.username+" -> "+friend+" err="+error);
  }).success(function(connection) {
    connection.desiredFrequency = newFrequency;
    connection.save().error(function(error) {
      logger.log("Unable to save desiredFrequency for "+friend+" because of error: "+error);
      res.status(401);
      return res.send(401);
    }).success(function() {
      res.status(200);
      res.send(auth.OK);
    });
  });
});




function findOrCreateConnection(user, friend, connectionState, displayName, desiredCallFrequency, callback) {
  logger.log("FindOrCreateConnection: "+user.username+" -> "+ friend.username);
  var query = "\"fromUser\"='" + user.username + "' AND \"toUser\"='"+ friend.username +"'";
  Contact.findOrCreate(
    {fromUser: user.username, toUser: friend.username},
    {fromUser: user.username, toUser: friend.username, connectionState: connectionState, displayName: displayName, desiredCallFrequency: desiredCallFrequency}
  ).error(function(error) {
    logger.error("error creating/finding connection entry "+user.username+" -> "+friend.username+" err="+error);
  }).success(function(connection, created) {
    //logger.log("created connection: "+user.username+ " -> "+friend.username+" as "+connectionState);
    callback(); // for queue
  });
}


/**
* Called from uploadContact to reduce nested callbacks and use async's queue()
* Here, we look to see if the contact exists in the User table and created it as a GHOST user if it doesn't
* Then we call findOrCreateConnection(), where we do the same on the Contact entry
*/
function createUserAndConnection(context, innerCallback) {
  var user = context.user, phoneNumber = context.phoneNumber, displayName = context.displayName, desiredCallFrequency= context.desiredCallFrequency;
  // phoneNumber isn't a confirmed Sapristi user yet (but may be a ghost or created user), create a Ghost user now
  User.findOrCreate(
    {username: phoneNumber},
    {mobileNumber: phoneNumber, authToken: 'fake', userState: 'GHOST'}
  ).error(function(error) {
    logger.error("Cannot findOrCreate "+phoneNumber+" err="+error);
  }).success(function(friend, created) {
    logger.log("FindOrCreate success: "+friend.username+" created? = "+created);
    findOrCreateConnection(user, friend, Contact.StateEnum.INVITED, displayName, desiredCallFrequency, innerCallback);
  });
}

/**
 * For a single contact of a user, look up whether one of the associated phone numbers is already an existing user
 * If so, create a Contact entry between the two users
 * Otherwise, create GHOST users for each of the phone numbers, and a Contact entry between the user and each of the GHOSTs
 * context contains context.user which is a User model object and context.contact which is a JSON object received from the client 
 */
function uploadContact(context, callback) {
  var user = context.user, contact = context.contact;
  var displayName = contact.displayName;
  var desiredCallFrequency = contact.desiredCallFrequency; 
  logger.log("uploadContact: "+displayName);

  contact.normalizedPhoneNumbers = [];
  contact.rawPhoneNumbers = [];

  if (contact.phoneNumbers.length == 0) {
    logger.error(contact.displayName + " has no phone numbers");
    callback();
    return;
  }
  for (var i=0; i<contact.phoneNumbers.length; i++) {
      var normalized = User.normalize(contact.phoneNumbers[i], User.Country.US); // TODO: this assumes the user is in the US and interprets all local numbers as US numbers...
      if (normalized==null || normalized=="") {
        logger.error("Can't normalize friend number, ignoring: "+contact.phoneNumbers[i]);
      } else {
        if (normalized == user.username) {
          // don't upload the contact if it's the user herself (e.g. I have myself in my address book...)
          logger.log("Skipping self contact: "+contact);
          callback();
          return;
        }
        contact.normalizedPhoneNumbers.push(normalized);
        contact.rawPhoneNumbers.push(contact.phoneNumbers[i]);
      }
  }

  if (contact.normalizedPhoneNumbers.length == 0) {
    logger.error(contact.displayName + " has no normalized phone numbers");
    callback();
    return;
  }

  var friend;
  // find if one of the phoneNumbers matches a Sapristi user
  // create query manually because I can't see how to do a "select ... IN [array]" with sequelize
  var query = "\"userState\"='" + User.UserStateEnum.CONFIRMED + "' and (";
  for (var k=0; k<contact.normalizedPhoneNumbers.length; k++) {
    if (k>0) query += " or ";
    query += " username='"+contact.normalizedPhoneNumbers[k]+"' "
  }
  query += ")"
  User.find({ where: query })
    .error(function(error) {
      logger.error("error retrieving users "+error+" query = "+query+" normalized="+contact.normalizedPhoneNumbers+" raw="+contact.phoneNumbers);
    }).success(function(friend) {
      if (friend) {
        // this contact is already a Sapristi user. So create a Contact if there isn't one already
        // and leave as-is if there is one since it may be already in a CONNECTED state and we don't want to reset it to INVITED)
        // Not that it makes a difference for now since we're virally considering INVITED to be the same as CONNECTED
        logger.log("Found a user for contact #"+i+" with username "+friend.username);
        findOrCreateConnection(user, friend, Contact.StateEnum.INVITED, displayName, desiredCallFrequency, callback);
      } else {
        var ghostCreationQueue = async.queue(createUserAndConnection, 1);
        ghostCreationQueue.drain = function() {
          logger.log("created all ghost users for contact "+displayName);
          callback();
        }
        for (var j=0; j<contact.normalizedPhoneNumbers.length; j++) {
          // Create a bunch of ghost users, with each of the phone numbers I have for this contact
          ghostCreationQueue.push({user: user, phoneNumber: contact.normalizedPhoneNumbers[j], displayName: displayName}, function(err) {
            logger.log("For contact "+displayName+", finished processing phone #"+j+" err="+err);
          });
          //createUserAndConnection(user, contact.normalizedPhoneNumbers[j], displayName, callback);
        }
      }
    });
  //
}



/**
 * Upload of all contacts by user
 */
router.post('/contacts',  auth.isAuthenticated, function(req, res) {
  logger.log("In Post /contacts: "+req.body.json);
  var user = req.user;  // sequelize object
  var contacts = JSON.parse(req.body.json);
  logger.log("Num contacts:: "+contacts.length);

  var contactQueue = async.queue(uploadContact, 1);

  contactQueue.drain = function() {
      logger.log('!!!! all contacts have been processed for user '+user.username);
      res.status(200);
      res.send(auth.OK);
  }

  for (var i=0; i<contacts.length; i++) {
    var contact = contacts[i];
    //uploadContact(user, contact);
    contactQueue.push({user:user, contact:contact, index: i}, function(err) {
      if (err) {
        logger.error("Error processing contact "+contact+": "+err);
        return;
      }
      logger.log("Finished processing contact "+contact);
    });
  }
});



/**
 * Returns the availability of this user's friends who are also Sapristi users
 */
router.get('/friend-availability', auth.isAuthenticated, function(req, res) {
  var user = req.user;
  if (user.userState != User.UserStateEnum.CONFIRMED) { // should really check this as a middleware in addition to isAuthenticated
    logger.error("Attempt to make a request with a non confirmed user: "+user.username);
    res.status(401);
    res.send(401);
    return;
  }

  /* SELECT "Contacts".*, "User"."availability", "User"."updatedAt", "User"."userState"
    FROM "Contacts" LEFT OUTER JOIN "Users" AS "User"
    ON "User"."username" = "Contacts"."toUser"
    WHERE "Contacts"."fromUser"='+145725925';
  */

  Contact.findAll({ where: {fromUser: user.username}, include: [{model: User, as: 'destination'}] })
  .error(function(error) {
    logger.error("error retrieving contacts "+error);
    res.status(401);
    res.send(401);
    return;
  }).success(function(friendList) {
    var availabilityList = [];

    for (i=0; i<friendList.length; i++) {
      var friend = friendList[i]; 
      var displayName = friend.displayName;
      var connectionState = friend.connectionState;
      var friendUser = friend.destination;
      var friendUserName = friendUser.username;
      var updatedAt = new Date(friendUser.updatedAt);
      var userState = friendUser.userState;
      var availability = friendUser.availability;
      /*if (connectionState != Contact.StateEnum.CONNECTED) {
        continue; // you can only see friends who have accepted your invitation
      }*/
      if (userState != User.UserStateEnum.CONFIRMED) {
        continue; // only confirmed users have a meaningful state
      }
      if (!availability) {
        logger.error("missing availability info for "+displayName);
        availability = User.AvailabilityEnum.UNKNOWN;
      }
      availabilityList.push({
        username: friendUserName, // the friend's normalized phone number
        availability: availability, // BUSY, UNKNOWN or AVAILABLE
        updatedAt: updatedAt.toISOString() // the time at which this user's availability was last changed
      });
      logger.log(req.user.username + " -> " + friendUserName+": "+displayName+" "+availability+" "+connectionState+" @ "+updatedAt.toISOString());
    }
    res.status(200);
    logger.log("sending availability list: "+JSON.stringify(availabilityList));
    res.send(availabilityList);
    logger.log("done sending availability matrix");
  });

});

module.exports = router;
