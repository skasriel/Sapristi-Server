var Logger = require('./Logger');
var logger = Logger.get(Logger.PASSPORT);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user.js');

//Serialize sessions
passport.serializeUser(function(user, done) {
  //logger.log("serialize: "+user+" "+user.username);
  done(null, user.username);
  //logger.log("done serializing");
});

passport.deserializeUser(function(username, done) {
  //logger.log("deserialize: "+username);
  //if (req.session.upgrade) req.session.upgrade(username); // redis session
  User.find({where: {username: username}}).success(function(user){
    //logger.log('Session: { username: ' + user.username + ', username: ' + user.username + ' }');
    done(null, user);
  }).error(function(err) {
    logger.error("error in deserializing "+username+": "+err);
    done(err, null);
  });
});

//Use local strategy
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    //logger.log("Looking for username: "+username+" with password "+password);
    User.find({ where: { username: username }}).success(function(user) {
      if (!user) {
        logger.error("Unknown user: "+username);
        done(null, false, { message: 'Unknown user' });
      } else if (!user.authenticate(password)) {
        logger.error("Wrong password for user: "+username);
        done(null, false, { message: 'Invalid password'});
      } else {
        //logger.log('Login (local) : { username: ' + user.username + ', username: ' + user.username + ' }');
        done(null, user);
      }
    }).error(function(err) {
      logger.error("strategy error: "+err);
      done(err);
    });
  }
));

module.exports = passport;

