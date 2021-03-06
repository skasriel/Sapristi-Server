'use strict';

var Logger = require('./Logger');
var logger = Logger.get(Logger.DEFAULT);

logger.info("starting");

var PhoneFormat = require('./PhoneFormat');

/** Express settings */
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session      = require('express-session');
var RedisStore = require('connect-redis')(session);
var flash    = require('connect-flash');


var User = require('./models/user');
var auth = require('./routes/auth');
var me = require('./routes/me');
var settings = require('./routes/settings');

var notificationManager = require('./NotificationManager');

var app = express();

var Sequelize = require('sequelize');
var sequelize = require('./db.js').sequelize;
var redis = require('./redis');

var passport = require('passport');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
//app.use(require('morgan')('dev'));
app.use(require('morgan')({ "stream": Logger.get(Logger.EXPRESS).stream }));

app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb'}));
app.use(cookieParser());

var redisOptions = {};
if (process.env.REDISTOGO_URL) 
    redisOptions = {url: process.env.REDISTOGO_URL};

 /*{host: 'localhost',
    port: 6379,
    db: 2,
    pass: 'RedisPASS'};*/
app.use(session({ store: new RedisStore(redisOptions), secret: 'klj2l34lkjslkjrwe2344rsx' }))

//app.use( ConnectRedisSessions( { app: "sapristi" } ) );

// listen for requests
/*app.use( function( req, res ){
    if( req.query.login ){
        // upgrade a session to a redis session by a user id
        logger.log("Upgrade session due to login");
        req.session.upgrade( req.query.user_id );
    }
    if( req.session.id && req.query.logout ){
        // kill the active session
        logger.log("Destroy session due to logout");
        req.session.destroy();
    }
    res.end( "Hello express redis sessions" );
});*/

//app.use(session({ secret: 'changemeinprod' })); // session secret


var strategy = require('./strategy.js');
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use(express.static(path.join(__dirname, '../www')));

app.use('/api/auth', auth);
app.use('/api/me', me);
app.use('/api/settings', settings);


/// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});*/

var server = app.listen(5000, function() {
    logger.log('Listening on port '+server.address().port);
});

/// error handlers

// development error handler
// will print stacktrace
/*if (true) { //app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}*/

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
  logger.log("checking for 401");
  // Just basic, should be filled out to next()
  // or respond on all possible code paths
  if(err instanceof Error) {
    logger.log("there's an error, is it 401");
    if(err.message === '401') {
        res.status(401);
        res.send(401);//res.render('error401');
        logger.log("yes, return 401");
    } else {
      res.send(message);
    }
  }
});*/
