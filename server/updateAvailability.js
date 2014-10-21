'use strict';
var async = require('async');

var Sequelize = require('sequelize');
var sequelize = require('./db.js').sequelize;


var redis = require('./redis');

var User = require('./models/user');
var TimeSlot = require('./models/timeslots');

var notificationManager = require('./NotificationManager');


var numToComplete = 0;

function run() {
  var now = new Date();
  var todayDayOfWeek = now.getDay(); // 0=sunday, 1=monday, ...
  var formattedNow = now.toISOString();

  //var dayType = (now.getDay()<=6) ? TimeSlot.DayTypeEnum.WEEKDAY : TimeSlot.DayTypeEnum.WEEKEND;
  //var time = now.getHours()*60 + now.getMinutes();
  /*var hour24 = now.getHours();
  var isPM, hour12;
  if (hour24>=12) {
    hour12 = hour24-12;
    isPM=true;
  } else {
    hour12 = hour24;
    isPM=false;
  }*/
  /*var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();
  var convertedNow = new Date(Date.UTC(2000, 0, 1, hours, minutes, seconds));
  */

  var convertedNow = new Date(); // this is Jan 1, 2000 but at the same time as now - in order to compare timeslots coming from USER_TIMESLOTS (which are recurring every day)
  convertedNow.setFullYear(2000);
  convertedNow.setMonth(0);
  convertedNow.setDate(1);
  var formattedConvertedNow = convertedNow.toISOString()

  // look for events where: 
  // recurrence is "0" and startDate < now < endDate (meaning: today, not recurring) 
  // OR recurrence contains this day of the week and startTime < this hour : this minute < endTime

  /// last run - a start date - now - an end date 
  TimeSlot.findAll({ where: Sequelize.or(
                        Sequelize.and({source: "CALENDAR"}, {startTime: {lt: formattedNow}}, {endTime: {gt: formattedNow}}),
                        Sequelize.and(["\"recurrence\" like '%"+todayDayOfWeek+"%'"], {startTime: {lt: formattedConvertedNow}}, {endTime: {gt: formattedConvertedNow}})
                        )})
  .error(function(error) {
    console.error("error retrieving timeslots "+error);
    return 100;
  }).success(function(timeslots) {
    var userAvailabilities = [];
    numToComplete = timeslots.length;

    // First, figure out the availability for each user with a matching timeslot (there may be several timeslots...)
    for (var i=0; i<timeslots.length; i++) {
      var timeslot = timeslots[i];
      console.log("Found timeslot: "+timeslot.toString());
      userAvailabilities[timeslot.username] = timeslot.availability
    }

    // Now, for each user whose availability changed, call update once (and only once to prevent duplicate push notifications)
    // TODO: we should also check whether the user has manually updated her availability recently and not override her choice if she has...
    var setAvailabilityQueue = async.queue(setUserAvailability, 1);

    setAvailabilityQueue.drain = function() {
      console.log('DONE updating user availabilities');
      process.exit(0);
      return;
    }

    for (var username in userAvailabilities) {
      console.log("Setting availability for "+username+" to "+userAvailabilities[username]);
      var availability = {
        username: username, 
        availability: userAvailabilities[username]
      }
      setAvailabilityQueue.push(availability, function(err) {
        console.log("Finished processing user: "+username+" err="+err);
      });
    }

    // TODO: Revert user's availability to previous state if outside of the availability timeslot

      /*
      var startTime = toTime(timeslot.startTime);
      var endTime = toTime(timeslot.endTime);
      var username = timeslot.username;
      if (startTime<=time && time<=endTime) {
        console.log("Setting user "+username+" to available because in timeslot: "+timeslot.startTime+" - "+timeslot.endTime+": "+time);
        usernames[username] = true;
        setUserAvailability(username, User.AvailabilityEnum.AVAILABLE);
      } else {
        if (!usernames[username])
          usernames[username] = false; // outside of user defined time slots -> need to set to UNKNOWN otherwise will stay AVAILABLE forever...
      }*/

    // now any user who is in usernames has a timeslot defined, but none that matched, and thus user should be marked as unknown availability
    /*for (var username in usernames) {
      var availability = usernames[username];
      console.log("Setting user "+username+" to "+availability);
      setUserAvailability(username, User.AvailabilityEnum.UNKNOWN);
    }*/
  });
}

function getRedisKey(username) {
  return "user:"+username+":availability";
}

function setUserAvailability(context, callback) {
  var username = context.username, newAvailability = context.availability;
  // check whether current availability (in redis cache) is the same as new
  redis.client.get(getRedisKey(username), function(err, currentAvailability) {
    if (newAvailability == currentAvailability) {
      console.log("User availability hasn't changed, skipping: "+username);
      callback();
      return;
    }
    User.find({ where: { username: username }})
    .error(function(error) {
      console.error("error finding user "+username);
      callback();
      return;
    }).success(function(user) {
      if (!user) {
        console.error("Can't find user "+username+" to update her availability to "+newAvailability);
        callback();
        return;
      }
      user.availability = newAvailability;
      user.save().error(function(error) {
        console.log("Unable to change availability for "+user.username+" because of error: "+error);
        callback();
        return;
      }).success(function() {
        notificationManager.sendAvailabilityPushNotifications(user);     // now notify all relevant users
        redis.client.set(getRedisKey(user.username), user.availability, redis.print); // keep the redis cache in sync
        callback();
        return;
      });    
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
