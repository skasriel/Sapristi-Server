/* Routes related to authorization/authentication and user management */


var express = require('express');
var router = express.Router();

var passport = require('passport'),
    User = require('../models/user');

var HOME = '/index.html', LOGIN='/login.html';


function IsAuthenticated(req,res,next) {
  //next(); // for now, bypass authentication

  if(req.isAuthenticated()) {
      next();
  } else {
    res.status(401);
    res.send(401);

    console.log("Not authorized "+req);
    next(new Error(401));
  }
}

router.get('/register', function(req, res) {
  console.log("In GET /register");
  var formData = new Object();
  for (var propName in req.query) {
      if (req.query.hasOwnProperty(propName)) {
          console.log(propName, req.query[propName]);
          formData[propName] = req.query[propName];
      }
  }
  res.send(formData);
});

// User registration
router.post('/register', function(req, res) {
  console.log("In Post /register");
  var username = req.body.username;
  var password = req.body.password;
  var mobileNumber = req.body.mobileNumber;

    var user = new User({
        'username' : req.body.username,
        'mobileNumber': req.body.mobileNumber
    });
    console.log("Fake creating user: "+user);

    /*User.register(user, password, function(err, account) {
        console.log("error? registering user: "+err+" user: "+account);
        if (err) {
          res.status(401);
          return res.send(401);
        }
        console.log("Now creating the req session");
        req.login(user, function(err) {
          if (err) {
            console.log("err in session: "+err);
            return next(err);
          }
          console.log("Created session for "+user);
          res.status(200);
          res.send(200);
          //res.redirect(HOME+"#/"+req.user.username);
        });
    });*/
    res.status(200);
    res.send("OK");
});


router.post('/login', passport.authenticate('local'), function(req, res) {
    console.log("logging in");
    res.redirect(HOME);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect(LOGIN);
});



// google ---------------------------------
// send to google to do the authentication
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

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

module.exports = router;
