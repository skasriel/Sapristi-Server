/* Routes related to authorization/authentication and user management */
var Logger = require('../Logger');
var logger = Logger.get(Logger.AUTH);


var express = require('express');
var router = express.Router();

var passport = require('passport'),
    User = require('../models/user');

var OK = {"status": "ok"};
var ERROR={"status": "error"};

// Shared function to verify that the user is logged in before attempting to respond to GET/POST
function isAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
      next();
  } else {
    logger.log("User isn't authenticated, returning 401");
    res.status(401);
    res.send(401);
    next(new Error(401));
  }
}

router.post('/login', passport.authenticate('local'), function(req, res) {
    logger.log("logging in");
    res.send(OK);
});

router.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy();
    setTimeout(function() {res.status(200); res.send(OK);}, 500);
});



// User registration
router.post('/register', function(req, res) {
  logger.log("In Post /register");

  req.logout();

  var rawMobileNumber = req.body.username;
  var password = req.body.password;
  var normalizedNumber = User.normalize(rawMobileNumber, User.Country.US);
  if (normalizedNumber == "" || normalizedNumber == null) {
    // error normalizing to e164 format...
    res.status(401);
    logger.errror("Unable to e164 on "+rawMobileNumber);
    return res.send({error: "Invalid phone number: "+rawMobileNumber});
  }
  var username = normalizedNumber;
  var authToken = password;

  // See if user already exists. If it's a GHOST user, then no problem, it's safe to change the state to CREATED
  // If it's already a CREATED or CONFIRMED account, not totally sure what we should do here...
  User.find({ where: { username: username }}).success(function(user) {
    if (!user) {
      user = User.build({
          'username' : normalizedNumber,
          'mobileNumber': normalizedNumber,
          'authToken': authToken,
          'rawMobileNumber': rawMobileNumber
      });
    } else {
      user.mobileNumber = username;
      user.authToken = authToken;
      user.rawMobileNumber = rawMobileNumber;
    }

    user.userState = User.UserStateEnum.CREATED;
    user.availability = User.AvailabilityEnum.AVAILABLE
    user.provider = 'local'; // what is this?
    user.salt = user.makeSalt();
    user.hashedPassword = user.encryptPassword(password, user.salt);

    user.save().error(function(error) {
      logger.error("Unable to create user "+username+" because of error: "+error);
      res.status(401);
      return res.send(401);
    }).success(function() {
      logger.log("Created new user: "+username);
      req.login(user, function(err) {
        logger.log("redis session upgrade for "+username);
        if (req.session.upgrade) req.session.upgrade(username); // redis session
        if (err) {
           logger.error("error creating session: "+err);
           res.status(401);
           return res.send(401);
        }
        var results = {
          "username": username,
          "authToken": authToken
        };
        res.status(200);
        res.send(results);
      });
    })
  }).error(function(err) {
    logger.error("Error in looking up user "+username+" err="+err)
    res.status(401);
    return res.send(401);
  });

});


// Verify mobile number confirmation code
router.post('/confirmation-code',  isAuthenticated, function(req, res) {
  logger.log("In Post /confirmation-code");
  var confirmationCode = req.body.confirmationCode;

  // Here should validate code with Twilio or something...

  // Mark user as confirmed in database
  var user = req.user;
  user.userState = User.UserStateEnum.CONFIRMED;
  user.save().error(function(error) {
    logger.log("Unable to change state for "+user.username+" because of error: "+error);
    res.status(401);
    return res.send(401);
  })
  .success(function() {
    res.status(200);
    res.send(OK);
  });
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
