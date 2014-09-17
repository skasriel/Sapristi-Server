var express = require('express');
var auth = require('./routes/auth');
var friends = require('./routes/friends');
var path = require('path');

var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'uwotm8' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('/auth', auth);
app.get('/friends', friends);

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

/*var express = require("express"),
    path = require("path"),
    morgan = require("morgan"),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    mongoStore = require('connect-mongo')(express),
    passport = require('passport');

var application_root = __dirname,
    static_root = path.join(application_root, "../www");

// database
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
  // Create your schemas and models here.
  console.log("success");
});

var mongoURL = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/sapristi_database';
console.log("Connecting to MongoDB on "+mongoURL);
mongoose.connect(mongoURL);

require('./passport-config').passport(passport); // pass passport for configuration

// config
var app = express();



// Setup routes
var auth = require('./routes/auth');
var friends = require('./routes/friends');


// launch server
var port = Number(process.env.PORT || 3000);
app.set('port', port);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'changethisinprod' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('/', routes.index);
app.get('/auth', auth);
app.get('/friends', friends);

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/
