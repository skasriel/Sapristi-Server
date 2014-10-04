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
  console.log("In Post /timeslots. username: "+req.user.username+" json="+req.body.json);
  var user = req.user;  // sequelize object
  var username = user.username;
  var timeslots = JSON.parse(req.body.json);
  console.log("Num timeslots: "+timeslots.length);

  TimeSlot.destroy({username: username, source: "USER_TIMESLOTS"})
  .error(function(error) {
    console.error("Unable to delete timeslots for "+username);
  }).success(function(numDestroyed) {
    var numCompleted=0;
    for (var i=0; i<timeslots.length; i++) {
      var timeslot = timeslots[i];
      TimeSlot.build({username: username, startTime: timeslot.startTime, endTime: timeslot.endTime, 
        availability: timeslot.availability, recurrence: timeslot.recurrence, source: timeslot.source})
        .save()
        .success(function(timeslot) {
          numCompleted++;
          console.log("successfully created #"+numCompleted+"/"+timeslots.length+": "+JSON.stringify(timeslot));
          if (numCompleted==timeslots.length) {
            res.status(200);
            res.send(auth.OK);
          };
        }).error(function(error) {
          console.error("Unable to create timeslot: "+req.user.username+","+req.body.json);
          res.status(500);
          res.send(auth.ERROR);
        });
      }
  });
});


module.exports = router;
