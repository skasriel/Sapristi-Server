/* Routes related to me */


var express = require('express');
var router = express.Router();

var passport = require('passport'),
    User = require('../models/user');

var auth = require('./auth');


// Toggle my availability busy / unknown / available
router.post('/availability',  auth.isAuthenticated, function(req, res) {
  console.log("In Post /availability");
  var newAvailability = req.body.availability;

  // Store to database
  User.find({ where: { username: req.username }})
    .error(function(err) {
        console.log("Unable to get user "+username);
        done(err);
      })
    .success(function(user) {
      user.availability = newAvailability;
      user.save()
        .error(function(error) {
          console.log("Unable to change availability for "+username+" because of error: "+error);
          res.status(401);
          return res.send(401);
        })
        .success(function() {
          // notify all contacts
          // send push notification
          res.status(200);
          res.send(OK);
        })
    });
});

module.exports = router;
