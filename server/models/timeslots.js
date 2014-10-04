console.log("starting timeslots model");

var PassportLocalStrategy = require('passport-local').Strategy;
var Sequelize = require('sequelize');
var sequelize = require('../db.js').sequelize;
var User = require('./user');


var TimeSlot = sequelize.define('TimeSlot', {
  username:     { type: Sequelize.STRING, references: User, referencesKey: "username"},
 // dayType:      { type: Sequelize.STRING}, 
	startTime:    { type: Sequelize.STRING},
  endTime:      { type: Sequelize.STRING},  // ISO encoding
  availability: { type: Sequelize.STRING},  // BUSY, AVAILABLE
  recurrence:   { type: Sequelize.STRING},  // String containing all #s representing days of week, e.g. "123" means "Monday, Tuesday, Wednesday" 
  source:       { type: Sequelize.STRING}  // "CALENDAR" or "USER_TIMESLOTS"
},
{
  instanceMethods: {
    toString: function() {
      return this.username+": "+this.startTime+"->"+this.endTime+" availability: "+this.availability+" recurrence: "+this.recurrence+" source: "+this.source;
    }
  }
}
);

TimeSlot.sync();
module.exports = TimeSlot;
console.log("registered TimeSlot schema");


