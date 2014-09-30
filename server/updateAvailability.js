'use strict';

var Sequelize = require('sequelize');
var sequelize = require('./db.js').sequelize;


var redis = require('./redis');

var User = require('./models/user');
var TimeSlot = require('./models/timeslots');

var numToComplete = 0;

function run() {
  var now = new Date();
  var dayType = (now.getDay()<=6) ? TimeSlot.DayTypeEnum.WEEKDAY : TimeSlot.DayTypeEnum.WEEKEND;
  var time = now.getHours()*60 + now.getMinutes();
  /*var hour24 = now.getHours();
  var isPM, hour12;
  if (hour24>=12) {
    hour12 = hour24-12;
    isPM=true;
  } else {
    hour12 = hour24;
    isPM=false;
  }*/

  /// last run - a start date - now - an end date 
  TimeSlot.findAll({ where: {dayType: dayType} })
  .error(function(error) {
    console.error("error retrieving timeslots "+error);
    return 100;
  }).success(function(timeslots) {
    var usernames = [];
    numToComplete = timeslots.length / 2; // two time slots per user

    for (var i=0; i<timeslots.length; i++) {
      var timeslot = timeslots[i];
      var startTime = toTime(timeslot.startTime);
      var endTime = toTime(timeslot.endTime);
      var username = timeslot.username;
      if (startTime<=time && time<=endTime) {
        console.log("Setting user "+username+" to available because in timeslot: "+timeslot.startTime+" - "+timeslot.endTime+": "+time);
        usernames[username] = true;
        setUserAvailability(username, User.AvailabilityEnum.AVAILABLE);
      } else {
        if (!usernames[username])
          usernames[username] = false;
      }
    }

    // now any user who is in usernames has a timeslot defined, but none that matched, and thus user should be marked as unknown availability
    for (var username in usernames) {
      if (usernames[username] == false) {
        console.log("Setting user "+username+" to UNKNOWN because outside of all users' time slots");
        setUserAvailability(username, User.AvailabilityEnum.UNKNOWN);
      }
    }
  });
}

function getRedisKey(username) {
  return "user:"+username+":availability";
}

function decrementAndExitIfDone() {
  if (--numToComplete <= 0) process.exit(0);
}

function setUserAvailability(username, newAvailability) {
  // check whether current availability (in redis cache) is the same as new
  var currentAvailability = redis.client.get(getRedisKey(username));
  if (newAvailability == currentAvailability) {
    console.log("User availability hasn't changed, skipping: "+username);
    decrementAndExitIfDone();
    return;
  }
  User.find({ where: { username: username }})
  .error(function(error) {
    console.error("error finding user "+username);
    decrementAndExitIfDone();
    return;
  }).success(function(user) {
    user.availability = newAvailability;
    user.save().error(function(error) {
      console.log("Unable to change availability for "+user.username+" because of error: "+error);
      decrementAndExitIfDone();
      return;
    }).success(function() {
      //sendPushNotifications(user);     // now notify all relevant users
      redis.client.set(getRedisKey(user.username), user.availability, redis.print); // keep the redis cache in sync
      decrementAndExitIfDone();
      return;
    });    
  });
}

function toTime(amPMTime) {
  var components = amPMTime.split(/[\s,:]+/);
  var hour24 = Number(components[0]);
  if (components[2].toLowerCase()=='pm')
    hour24 += 12;
  var time = hour24 * 60 + Number(components[1]);
  return time;
}

var retCode = run();
//process.exit(retCode);
