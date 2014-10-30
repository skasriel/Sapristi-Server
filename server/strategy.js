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
    //logger.log("Looking for username: "+username);
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

/*
var strategy = {};
  strategy.localStrategy = new PassportLocalStrategy({
    username: 'username',
    password: 'password'
  },

  function (username, password, done) {
    logger.log("In strategy, looking up user: "+username+" "+password)
    var User = require('./models/User').User;
    User.find({username: username}).success(function(user) {
      if (!user) {
        logger.log("user not found!");
        return done(null, false, { message: 'Nobody here by that name'} );
      }
      if (user.password !== password) {
        logger.log("wrong password!");
        return done(null, false, { message: 'Wrong password'} );
      }
      logger.log("correct login")
      return done(null, { username: user.username });
    });
  }
);
strategy.validPassword = function(password) {
  logger.log("Strategy.validPassport: "+password+" ? "+this.password);
  return this.password === password;
}
strategy.serializeUser = function(user, done) {
  logger.log("Strategy.serializeUser: "+user);
  done(null, user);
};
strategy.deserializeUser = function(obj, done) {
  logger.log("Strategy.deserializeUser: "+obj);
  done(null, obj);
};
module.exports = strategy;
*/
