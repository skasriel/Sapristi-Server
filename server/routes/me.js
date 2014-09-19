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

  // Change availability in database
  var user = req.user;
  switch(newAvailability) {
    case User.AvailabilityEnum.AVAILABLE:
    case User.AvailabilityEnum.UNKNOWN:
    case User.AvailabilityEnum.BUSY:
      user.availability = newAvailability;
      break;
    default:
      user.availability = User.AvailabilityEnum.UNKNOWN;
      console.log("Unknown availability: "+newAvailability+" setting to UNKNOWN instead");
  }
  user.save().error(function(error) {
    console.log("Unable to change availability for "+user.username+" because of error: "+error);
    res.status(401);
    return res.send(401);
  })
  .success(function() {
    res.status(200);
    res.send(OK);
  });
});

module.exports = router;
