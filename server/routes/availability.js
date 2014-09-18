/* Routes related to availability */


var express = require('express');
var router = express.Router();

var passport = require('passport'),
    User = require('../models/user');

var OK = {"status": "ok"};

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

// Verify mobile number confirmation code
router.post('/availability',  IsAuthenticated, function(req, res) {
  console.log("In Post /availability");
  var newAvailability = req.body.availability;

  // Store to database

  // notify all contacts

  // send push notification

  res.status(200);
  res.send(OK);
});
