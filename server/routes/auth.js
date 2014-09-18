/* Routes related to authorization/authentication and user management */


var express = require('express');
var router = express.Router();

var passport = require('passport'),
    User = require('../models/user');

var OK = {"status": "ok"};

function isAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
      next();
  } else {
    console.log("User isn't authenticated, returning 401");
    res.status(401);
    res.send(401);
    next(new Error(401));
  }
}


// User registration
router.post('/register', function(req, res) {
  console.log("In Post /register");
  var username = req.body.username;
  var password = req.body.password;
  var mobileNumber = req.body.mobileNumber;
  var authToken = password;


  var user = User.build({
      'username' : req.body.username,
      'mobileNumber': req.body.mobileNumber,
      'authToken': authToken
  });
  user.provider = 'local'; // what is this?
  user.salt = user.makeSalt();
  user.hashedPassword = user.encryptPassword(password, user.salt);
  console.log('New User (local) : { id: ' + user.id + ' username: ' + user.username + ' }');

  user.save().error(function(error) {
    console.log("Unable to create user "+username+" because of error: "+error);
    res.status(401);
    return res.send(401);
  }).success(function() {
    console.log("Created new user in DB: "+username+" id="+user.id);
    req.login(user, function(err) {
      if (err) {
        console.log("error creating session: "+err);
        res.status(401);
        return res.send(401);
      }

      console.log("Created session for "+username);
      var results = {
        "username": username,
        "authToken": authToken
      };
      res.status(200);
      res.send(results);
    });
  });
});

// Verify mobile number confirmation code
router.post('/confirmation-code',  isAuthenticated, function(req, res) {
  console.log("In Post /confirmation-code");
  var confirmationCode = req.body.confirmationCode;
  // Here should validate code with Twilio or something...

  // Mark user as confirmed in database

  res.status(200);
  res.send(OK);
});




router.post('/login', passport.authenticate('local'), function(req, res) {
    console.log("logging in");
    res.send(OK);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.send(OK);
});



// google ---------------------------------
// send to google to do the authentication
/*router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect : HOME,
    failureRedirect : LOGIN
  }), function(req, res) {
  });

// google for users who have already linked their account
router.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

// the callback after google has authorized the user
router.get('/connect/google/callback',
  passport.authorize('google', {
    successRedirect : HOME,
    failureRedirect : LOGIN
  }));
  */

module.exports = router;
module.exports.isAuthenticated = isAuthenticated;
module.exports.OK = OK;
