/* Routes related to settings */

var async = require('async');
var express = require('express');
var router = express.Router();

var passport = require('passport'),
    auth = require('./auth'),
    Sequelize = require('sequelize'),
    User = require('../models/user'),
    Contact = require('../models/contact'),
    TimeSlot = require('../models/timeslots.js');

var apn = require('apn');


/**
 * Save my timeslots (times during which the server should show me as available to my frineds)
 */
router.post('/timeslots',  auth.isAuthenticated, function(req, res) {
  console.log("In Post /timeslots "+req.body.date+" username: "+req.user.username);
  var dates = req.body.date;
  TimeSlot.destroy({username: req.user.username})
  .error(function(error) {
    console.error("Unable to delete timeslots for "+req.user.username);
  }).success(function(numDestroyed) {
    var numCompleted=0;
    for (var section=0; section<2; section++) {
      var dayType = (section==0) ? TimeSlot.DayTypeEnum.WEEKDAY : TimeSlot.DayTypeEnum.WEEKEND;
      for (var row=0; row<2; row++) {
        TimeSlot.build({username: req.user.username, dayType: dayType, startTime: dates[section][2*row], endTime: dates[section][2*row+1]})
          .save()
          .success(function(timeslot) {
            console.log("successfully created: "+JSON.stringify(timeslot));
            numCompleted++;
            if (numCompleted==4) {
              res.status(200);
              res.send(auth.OK);
            };
          }).error(function(error) {
            console.error("Unable to create timeslot: "+req.user.username+","+dayType+","+dates[section][2*row]+","+dates[section][2*row+1]);
            res.status(500);
            res.send(auth.ERROR);
          });
      }
    }
  });
});


module.exports = router;
