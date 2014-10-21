var apn = require('apn');
var Contact = require('./models/contact');
var User = require('./models/user');

var options = { "production": false };
var apnConnection = new apn.Connection(options);

apnConnection.on('connected', function() {
    console.log("Connected");
});

apnConnection.on('transmitted', function(notification, device) {
    console.log("Notification transmitted to:" + device.token.toString('hex'));
});

apnConnection.on('transmissionError', function(errCode, notification, device) {
    console.error("Notification caused error: " + errCode + " for device ", device, notification);
    if (errCode == 8) {
        console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
    }
});

apnConnection.on('timeout', function () {
    console.log("Connection Timeout");
});

apnConnection.on('disconnected', function() {
    console.log("Disconnected from APNS");
});

apnConnection.on('socketError', console.error);

// Setup a connection to the Apple APN feedback service using a custom interval (in seconds)
var feedback = new apn.feedback({ address:'feedback.sandbox.push.apple.com', interval: 60 });

feedback.on('feedback', handleFeedback);
feedback.on('feedbackError', console.error);

function handleFeedback(feedbackData) {
	var time, device;
	for(var i in feedbackData) {
		time = feedbackData[i].time;
		device = feedbackData[i].device;
		console.log("Device: " + device.toString('hex') + " has been unreachable, since: " + time);
	}
}

var self = module.exports = {
	sendNotification: function(token, badge, title, payload) {
		var device = new apn.Device(token);
		var note = new apn.Notification();
		note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		note.badge = badge; // 1
		note.sound = "ping.aiff";
		note.alert = "\uD83D\uDCE7 \u2709 "+title;
		note.payload = payload; //{'messageFrom': 'Sapristi'};

		apnConnection.pushNotification(note, device);
	};

	sendAvailabilityPushNotifications: function(user) {
	  Contact.findAll({ where: {toUser: user.username}, include: [{model: User, as: 'origin'}] })
	  .error(function(error) {
	    console.error("error finding users to send push notifications for "+user.username+": "+error);
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
	        console.log("No APN token to send push notifications for user "+displayName);
	        return;
	      }

	      var badge = 3;
	      var title = "Your friend "+displayName+" changed availability to "+user.availability;
	      var payload = {'messageFrom': 'Sapristi'};
	      self.sendNotification(deviceToken, badge, title, payload);
	    }
	  });
	};
};



console.log("Started NotificationManager");
