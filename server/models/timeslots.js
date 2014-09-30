console.log("starting timeslots model");

var PassportLocalStrategy = require('passport-local').Strategy;
var Sequelize = require('sequelize');
var sequelize = require('../db.js').sequelize;
var User = require('./user');


var TimeSlot = sequelize.define('TimeSlot', {
  username:     { type: Sequelize.STRING, references: User, referencesKey: "username"},
  dayType:      { type: Sequelize.STRING}, 
	startTime:    { type: Sequelize.STRING},
  endTime:      { type: Sequelize.STRING}
});

TimeSlot.DayTypeEnum = {
  WEEKDAY: 'WEEKDAY',
  WEEKEND: 'WEEKEND'
};

TimeSlot.sync();
module.exports = TimeSlot;
console.log("registered TimeSlot schema");


