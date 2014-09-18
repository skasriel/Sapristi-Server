var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session      = require('express-session');
var flash    = require('connect-flash');

var auth = require('./routes/auth');
var friends = require('./routes/friends');
var contacts = require('./routes/contacts');

var app = express();

var mongoose = require('mongoose');
//var mongoStore = require('connect-mongo')(express); //doesn't seem to work with express4
var passport = require('passport');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(session({ secret: 'changemeinprod' })); // session secret


/** Configure Passport for Auth */
var LocalStrategy    = require('passport-local').Strategy;
var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use(express.static(path.join(__dirname, '../www')));

app.use('/api/auth', auth);
app.use('/api/contacts', contacts);
app.use('/api/friends', friends);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/** Database */
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
  // Create your schemas and models here.
  console.log("success");
});

var mongoURL = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/workplace_database';
console.log("Connecting to MongoDB on "+mongoURL);
mongoose.connect(mongoURL);


var pg = require('pg');
var conString = process.env.DATABASE_URL || "postgres://sapristi:changeme@localhost:5432/sapristi";
var client = new pg.Client(conString);
client.connect();
console.log("Connected to "+conString);


/// error handlers

// development error handler
// will print stacktrace
if (true) { //app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
/*
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});*/


module.exports = app;




/*app.use(function(err,req,res,next) {
  console.log("checking for 401");
  // Just basic, should be filled out to next()
  // or respond on all possible code paths
  if(err instanceof Error) {
    console.log("there's an error, is it 401");
    if(err.message === '401') {
        res.status(401);
        res.send(401);//res.render('error401');
        console.log("yes, return 401");
    } else {
      res.send(message);
    }
  }
});*/
