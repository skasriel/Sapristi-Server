var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user.js');

//Serialize sessions
passport.serializeUser(function(user, done) {
  //console.log("serialize: "+user+" "+user.username);
  done(null, user.username);
  //console.log("done serializing");
});

passport.deserializeUser(function(username, done) {
  console.log("deserialize: "+username);
  User.find({where: {username: username}}).success(function(user){
    //console.log('Session: { username: ' + user.username + ', username: ' + user.username + ' }');
    done(null, user);
  }).error(function(err) {
    console.error("error in deserializing "+username+": "+err);
    done(err, null);
  });
});

//Use local strategy
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    //console.log("Looking for username: "+username);
    User.find({ where: { username: username }}).success(function(user) {
      if (!user) {
        console.error("Unknown user: "+username);
        done(null, false, { message: 'Unknown user' });
      } else if (!user.authenticate(password)) {
        console.error("Wrong password for user: "+username);
        done(null, false, { message: 'Invalid password'});
      } else {
        //console.log('Login (local) : { username: ' + user.username + ', username: ' + user.username + ' }');
        done(null, user);
      }
    }).error(function(err) {
      console.error("strategy error: "+err);
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
    console.log("In strategy, looking up user: "+username+" "+password)
    var User = require('./models/User').User;
    User.find({username: username}).success(function(user) {
      if (!user) {
        console.log("user not found!");
        return done(null, false, { message: 'Nobody here by that name'} );
      }
      if (user.password !== password) {
        console.log("wrong password!");
        return done(null, false, { message: 'Wrong password'} );
      }
      console.log("correct login")
      return done(null, { username: user.username });
    });
  }
);
strategy.validPassword = function(password) {
  console.log("Strategy.validPassport: "+password+" ? "+this.password);
  return this.password === password;
}
strategy.serializeUser = function(user, done) {
  console.log("Strategy.serializeUser: "+user);
  done(null, user);
};
strategy.deserializeUser = function(obj, done) {
  console.log("Strategy.deserializeUser: "+obj);
  done(null, obj);
};
module.exports = strategy;
*/
