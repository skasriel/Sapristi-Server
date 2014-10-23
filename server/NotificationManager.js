var Logger = require('./Logger');
var logger = Logger.get(Logger.NOTIFICATION_MANAGER);


var apn = require('apn');
var Contact = require('./models/contact');
var User = require('./models/user');

var options = {
	"cert": "SapristiDevCert.pem",
	"key": "SapristiDevKey.pem",
	"passphrase": "320paris",
	//"pfx": "Sapristi.p12", 
	"production": false 
};
var apnConnection = new apn.Connection(options);

apnConnection.on('connected', function() {
    logger.log("Connected");
});

apnConnection.on('transmitted', function(notification, device) {
    logger.log("Notification transmitted to:" + device.token.toString('hex'));
});

apnConnection.on('transmissionError', function(errCode, notification, device) {
    logger.error("Notification caused error: " + errCode + " for device ", device, notification);
    if (errCode == 8) {
        logger.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
    }
});

apnConnection.on('timeout', function () {
    logger.log("Connection Timeout");
});

apnConnection.on('disconnected', function() {
    logger.log("Disconnected from APNS");
});

apnConnection.on('socketError', logger.error);

// Setup a connection to the Apple APN feedback service using a custom interval (in seconds)
var feedback = new apn.feedback({ address:'feedback.sandbox.push.apple.com', interval: 60 });

feedback.on('feedback', handleFeedback);
feedback.on('feedbackError', logger.error);

function handleFeedback(feedbackData) {
	var time, device;
	for(var i in feedbackData) {
		time = feedbackData[i].time;
		device = feedbackData[i].device;
		logger.log("Device: " + device.toString('hex') + " has been unreachable, since: " + time);
	}
}


// Public
var self = module.exports = {
	sendNotification: function(token, badge, title, payload) {
		var device = new apn.Device(token);
		var note = new apn.Notification();
		note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		note.badge = badge; // 1
		note.sound = "ping.aiff";
		note.alert = title // "\uD83D\uDCE7 \u2709 "+title;
		note.payload = payload; //{'messageFrom': 'Sapristi'};

		apnConnection.pushNotification(note, device);
	},

	// User has changed her availability. Notify her reverse friends
	sendAvailabilityPushNotifications: function(user) {
		Contact.findAll({ where: {toUser: user.username}, include: [{model: User, as: 'origin'}] })
		 .error(function(error) {
		 	logger.error("error finding users to send push notifications for "+user.username+": "+error);
	    	return;
	    }).success(function(reverseFriendList) {
			// reverseFriendList contains the Sapristi users who have this user as a friend
		    for (i=0; i<reverseFriendList.length; i++) {
		    	var contact = reverseFriendList[i];
		      	var connectionState = contact.connectionState;
	      		// TODO: Check that user is also friends with "contact", since otherwise we're letting people see availabilities they shouldn't be seeing...
	      		/*if (connectionState != Contact.StateEnum.CONNECTED) {
		      	// this isn't the correct logic. I really need to look up the other way: did I send a similar invitation
		        	continue; // you can only see friends who have accepted your invitation
		      	}*/
		      	var fromUser = contact.origin;
		      	var displayName = contact.displayName; // this is my name, as stored in their address book
		      	var deviceToken = fromUser.apnToken;
		      	if (! deviceToken) {
	        		logger.log("No APN token to send push notifications for user "+displayName);
	        		return;
	      		}

		      	var badge = 0;
		      	if (user.availability == User.AvailabilityEnum.AVAILABLE) {
			    	var title = displayName+" is available for a call";
			      	var payload = {
			      		"category": "AVAILABILITY_CATEGORY",
			      		"messageFrom": "Sapristi",
			      		"username": user.username
			      	};
			      	self.sendNotification(deviceToken, badge, title, payload);
		      	} else {
		      		// Don't push anything out
		      	}
			}
		});
	},

	// User has just registered. Notify her reverse friends
	sendRegistrationPushNotifications: function(user) {
		Contact.findAll({ where: {toUser: user.username}, include: [{model: User, as: 'origin'}] })
		 .error(function(error) {
		 	logger.error("error finding users to send push notifications for "+user.username+": "+error);
	    	return;
	    }).success(function(reverseFriendList) {
			// reverseFriendList contains the Sapristi users who have this user as a friend
		    for (i=0; i<reverseFriendList.length; i++) {
		    	var contact = reverseFriendList[i];
		      	var connectionState = contact.connectionState;
	      		// TODO: Check that user is also friends with "contact", since otherwise we're letting people see availabilities they shouldn't be seeing...
	      		/*if (connectionState != Contact.StateEnum.CONNECTED) {
		      	// this isn't the correct logic. I really need to look up the other way: did I send a similar invitation
		        	continue; // you can only see friends who have accepted your invitation
		      	}*/
		      	var fromUser = contact.origin;
		      	var displayName = contact.displayName; // this is my name, as stored in their address book
		      	var deviceToken = fromUser.apnToken;
		      	if (! deviceToken) {
	        		logger.log("No APN token to send push notifications for user "+displayName);
	        		return;
	      		}

		      	var badge = 0;
		    	var title = displayName+" just signed up for Sapristi. You can now see her availability";
		      	var payload = {
			      		"category": "AVAILABILITY_CATEGORY",
			      		"messageFrom": "Sapristi",
			      		"username": user.username
			    };
			    self.sendNotification(deviceToken, badge, title, payload);
			}
		});
	}
};



logger.log("Started NotificationManager");
