var PassportLocalStrategy = require('passport-local').Strategy;


var strategy = {};
  strategy.localStrategy = new PassportLocalStrategy({
    username: 'username',
    password: 'password'
  },

  function (username, password, done) {
    var User = require('./models/User').User;
    User.find({username: username}).success(function(user) {
      if (!user) {
        return done(null, false, { message: 'Nobody here by that name'} );
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Wrong password'} );
      }
      return done(null, { username: user.username });
    });
  }
);
strategy.validPassword = function(password) {
  console.log("Strategy.validPassport: "+password+" ? "+this.password);
  return this.password === password;
}
strategy.serializeUser = function(user, done) {
  console.log("Strategy.serializeUser: "+user);ß
  done(null, user);
};
strategy.deserializeUser = function(obj, done) {
  console.log("Strategy.deserializeUser: "+obj);
  done(null, obj);
};
module.exports = strategy;
