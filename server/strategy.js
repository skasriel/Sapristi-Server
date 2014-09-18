var PassportLocalStrategy = require('passport-local').Strategy;


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
