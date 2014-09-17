var sapristi = angular.module('sapristi.controllers', []);

sapristi.controller('DashCtrl', function($scope) {

});


sapristi.controller('RegisterCtrl', function($scope, AuthenticationService) {

  $scope.registerMobileNumber = function() {
    var mobileNumber = $scope.mobileNumber;
    $scope.user = {
      'username': mobileNumber,
      'password': "changeme",
      'mobileNumber': mobileNumber
    };
    $scope.message = "";
    //AuthenticationService.login($scope.user);
    AuthenticationService.register($scope.user);
  }


  $scope.$on('event:auth-loginRequired', function(e, rejection) {
    alert("login required");
    //$scope.loginModal.show();
  });

  $scope.$on('event:auth-loginConfirmed', function() {
    alert("login confirmed");
     $scope.username = null;
     $scope.password = null;
     //$scope.loginModal.hide();
  });

  $scope.$on('event:auth-login-failed', function(e, status) {
    var error = "Login failed.";
    alert("login failed: "+status);
    if (status == 401) {
      error = "Invalid Username or Password.";
    }
    $scope.message = error;
  });

  $scope.$on('event:auth-logout-complete', function() {
    alert("Logged out successfully");
    $state.go('app.home', {}, {reload: true, inherit: false});
  });

});



sapristi.controller('FriendsCtrl', function($scope, $routeParams, $http) {
  //  $scope.friends = Friends.all();

  // Pull list of friends from server
  console.log('getting friends list');
  $http.get('http://localhost:3000/api/friends').success(function(data) {
    $scope.contacts = data;
    $scope.$parent.contacts = data;
    $rootScope.contacts = data;
    console.log(' Friend list: '+data);
  })
  .error(function(data, status) {
    console.log("Get current user list error: "+status+" "+data.error);
  });
});



sapristi.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
});



sapristi.controller('AccountCtrl', function($scope, $http, baseURL, $state, $rootScope) {

  /*
    Pull the native address book, post it to the server, receive back the subset of numbers which map to a registered user
  */
  $scope.addFromAddressBook = function() {
    if (typeof ContactFindOptions !='undefined') {
      // native environment
      var obj = new ContactFindOptions();
      obj.filter = "";
      obj.multiple = true;
      navigator.contacts.find(["displayName", "name", "phoneNumbers", "birthday", "photos"], contacts_success, contacts_fail, obj);
    } else {
      // mock environment (ionic serve)
      var defaultContactBook = '[{"id":1,"rawId":"","displayName":"","name":{"givenName":"Kate","formatted":"Kate Bell","middleName":"","familyName":"Bell","honorificPrefix":"","honorificSuffix":""},"nickname":"","phoneNumbers":[{"type":"mobile","value":"(555) 564-8583","id":0,"pref":false},{"type":"other","value":"(415) 555-3695","id":1,"pref":false}],"emails":[{"type":"work","value":"kate-bell@mac.com","id":0,"pref":false},{"type":"work","value":"www.icloud.com","id":1,"pref":false}],"addresses":[{"postalCode":"94010","type":"work","id":0,"locality":"Hillsborough","pref":"false","streetAddress":"165 Davis Street","region":"CA","country":""}],"ims":"","organizations":[{"name":"Creative Consulting","title":"Producer","type":"","pref":"false","department":""}],"birthday":254145600000,"note":"","photos":"","categories":"","urls":""},{"id":2,"rawId":"","displayName":"","name":{"givenName":"Daniel","formatted":"Daniel Higgins Jr.","middleName":"","familyName":"Higgins","honorificPrefix":"","honorificSuffix":"Jr."},"nickname":"","phoneNumbers":[{"type":"home","value":"555-478-7672","id":0,"pref":false},{"type":"mobile","value":"(408) 555-5270","id":1,"pref":false},{"type":"fax","value":"(408) 555-3514","id":2,"pref":false}],"emails":[{"type":"home","value":"d-higgins@mac.com","id":0,"pref":false}],"addresses":[{"postalCode":"94925","type":"home","id":0,"locality":"Corte Madera","pref":"false","streetAddress":"332 Laguna Street","region":"CA","country":"USA"}],"ims":"","organizations":"","birthday":"","note":"Sister: Emily","photos":"","categories":"","urls":""},{"id":3,"rawId":"","displayName":"","name":{"givenName":"John","formatted":"John Appleseed","middleName":"","familyName":"Appleseed","honorificPrefix":"","honorificSuffix":""},"nickname":"","phoneNumbers":[{"type":"mobile","value":"888-555-5512","id":0,"pref":false},{"type":"home","value":"888-555-1212","id":1,"pref":false}],"emails":[{"type":"work","value":"John-Appleseed@mac.com","id":0,"pref":false}],"addresses":[{"postalCode":"30303","type":"work","id":0,"locality":"Atlanta","pref":"false","streetAddress":"3494 Kuhl Avenue","region":"GA","country":"USA"},{"postalCode":"30303","type":"home","id":1,"locality":"Atlanta","pref":"false","streetAddress":"1234 Laurel Street","region":"GA","country":"USA"}],"ims":"","organizations":"","birthday":330523200000,"note":"College roommate","photos":"","categories":"","urls":""},{"id":4,"rawId":"","displayName":"","name":{"givenName":"Anna","formatted":"Anna Haro","middleName":"","familyName":"Haro","honorificPrefix":"","honorificSuffix":""},"nickname":"Annie","phoneNumbers":[{"type":"home","value":"555-522-8243","id":0,"pref":false}],"emails":[{"type":"home","value":"anna-haro@mac.com","id":0,"pref":false}],"addresses":[{"postalCode":"94965","type":"home","id":0,"locality":"Sausalito","pref":"false","streetAddress":"1001  Leavenworth Street","region":"CA","country":"USA"}],"ims":"","organizations":"","birthday":494164800000,"note":"","photos":"","categories":"","urls":""},{"id":5,"rawId":"","displayName":"","name":{"givenName":"Hank","formatted":"Hank M. Zakroff","middleName":"M.","familyName":"Zakroff","honorificPrefix":"","honorificSuffix":""},"nickname":"","phoneNumbers":[{"type":"work","value":"(555) 766-4823","id":0,"pref":false},{"type":"other","value":"(707) 555-1854","id":1,"pref":false}],"emails":[{"type":"work","value":"hank-zakroff@mac.com","id":0,"pref":false}],"addresses":[{"postalCode":"94901","type":"work","id":0,"locality":"San Rafael","pref":"false","streetAddress":"1741 Kearny Street","region":"CA","country":""}],"ims":"","organizations":[{"name":"Financial Services Inc.","title":"Portfolio Manager","type":"","pref":"false","department":""}],"birthday":"","note":"","photos":"","categories":"","urls":""},{"id":6,"rawId":"","displayName":"","name":{"givenName":"David","formatted":"David Taylor","middleName":"","familyName":"Taylor","honorificPrefix":"","honorificSuffix":""},"nickname":"","phoneNumbers":[{"type":"home","value":"555-610-6679","id":0,"pref":false}],"emails":"","addresses":[{"postalCode":"94920","type":"home","id":0,"locality":"Tiburon","pref":"false","streetAddress":"1747 Steuart Street","region":"CA","country":"USA"}],"ims":"","organizations":"","birthday":897912000000,"note":"Plays on Cole\'s Little League Baseball Team\n","photos":"","categories":"","urls":""}]';
      defaultContactBook = JSON.parse(defaultContactBook);
      contacts_success(defaultContactBook);
    }
  }
  function contacts_success(contacts) {
    alert("contacts: "+JSON.stringify(contacts));
    $scope.contacts = convertFromNative(contacts);
    alert("converted contacts: "+JSON.stringify($scope.contacts));
    $rootScope.contacts = $scope.contacts;

    // send contacts to server & get back info on who's already a user
    $http.post(baseURL+'/api/contacts', {'contacts': $scope.contacts})
      .success(function(data, status, headers, config) {
        console.log("Post friends result: "+status+" - "+data+" "+" err="+data.error);
        var registeredNumbers = data;

        var registeredUsers = new Array();
        var nonUsers = new Array();
        var contactBook = $scope.contacts;

        // Find all the registered users based on the registered numbers
        for (var i=0; i<registeredNumbers.length; i++) {
          var registeredNumber = registeredNumbers[i];
          for (var j=0; j<contactBook.length; j++) {
            if (contactBook[j].phoneNumbers.indexOf(registeredNumber)>=0) {
              registeredUsers.push(contactBook[j]);
              continue;
            }
          }
        }
        // find all the non registered users
        for (var j=0; j<contactBook.length; j++) {
          var contains = false;
          for (var i=0; i<registeredNumbers.length; i++) {
            if (contactsBook[j].phoneNumbers.indexOf(registeredNumbers[i])>=0) {
              contains = true;
              break;
            }
          }
          if (! contains)
            nonUsers.push(contactBook[j]);
        }

        $scope.registeredUsers = $rootScope.registeredUsers = registeredUsers;
        $scope.nonUsers = $rootScope.nonUsers = nonUsers;

        console.log("Registered list = "+JSON.stringify($scope.registeredUsers));
        console.log("Non user list = "+JSON.stringify($scope.nonUsers));

        $state.go('register.select-friends'); //, {}, {reload: true, inherit: false});

        // do something here!
      }).error(function(data, status) {
        console.log("Post message error: "+status+" "+data.error);
      });
  }
  function contacts_fail(msg) {
    console.log("get_contacts() Error: " + msg);
  }

});


function getAvailabilityIcon(availability) {
  if (availability=="available") return "ion-checkmark";
  else if (availability=="busy") return "ion-close";
  else if (availability=="eager") return "ion-checkmark";
  else return "ion-help";
};

function updateAvailabilityIcon(friend) {
  friend.availabilityIcon = getAvailabilityIcon(friend.availability);
  //alert(friend.availability+" "+JSON.stringify(friend)+"->"+getAvailabilityIcon(friend.availability))
}

function convertFromNative(nativeContacts) {
    // Get list of contacts from native address book, then upload to server
    console.log("convert from native contacts");
    var contacts = new Array();
    console.log("# Native contacts: "+nativeContacts);
    for (var i=0; i<nativeContacts.length; i++) {
      var nativeContact = nativeContacts[i];
      console.log("Handling contact: "+JSON.stringify(nativeContact));
      var nativePhoneNumbers = nativeContact.phoneNumbers;
      var nativePhotos = nativeContact.photos;
      var phoneNumbers = new Array();
      for (var j=0; j<nativePhoneNumbers.length; j++) {
        var phoneNumber = {
          'type': nativePhoneNumbers[j].type,
          'value': nativePhoneNumbers[j].value,
          'pref': nativePhoneNumbers[j].pref
        };
        phoneNumbers.push(phoneNumber);
      }
      var photos = new Array();
      if (nativePhotos && nativePhotos.length>0) {
        for (var k=0; k<nativePhotos.length; k++) {
          var photo = {
            'type': nativePhotos[k].type,
            'value': nativePhotos[k].value,
            'pref': nativePhotos[k].pref
          };
          photos.push(photo);
        }
      }
      var displayName = nativeContact.displayName;
      if (!displayName || displayName=='') {
        // then pull it from other fields
        displayName = nativeContact.name.formatted;
      }
      var contact = {
        'id': nativeContact.id,
        'displayName': displayName,
        'phoneNumbers': phoneNumbers,
        'photos': photos,
        'birthday': nativeContact.birthday,
        'defaultPhoto': photos[0],
        'defaultPhoneNumber': phoneNumbers[0]
      };
      contacts.push(contact);
    }
    console.log("Done converting "+contacts.length+" contacts");

    return contacts;

    /*for (var i=0; i<$scope.friends.length; i++)
      updateAvailabilityIcon($scope.contacts[i]);*/
}



sapristi.controller('ShowLoginCtrl', function($scope, $state, $ionicModal) {
  $ionicModal.fromTemplateUrl('templates/enter-mobile-number.html', function(modal) {
      $scope.loginModal = modal;
    },
    {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }
  );
  //Be sure to cleanup the modal by removing it from the DOM
  $scope.$on('$destroy', function() {
    $scope.loginModal.remove();
  });
});

sapristi.controller('LoginCtrl', function($scope, $http, $state, AuthenticationService) {
  $scope.message = "";

  $scope.user = {
    username: null,
    password: null
  };

  $scope.login = function() {
    AuthenticationService.login($scope.user);
  };

  $scope.$on('event:auth-loginRequired', function(e, rejection) {
    $scope.loginModal.show();
  });

  $scope.$on('event:auth-loginConfirmed', function() {
     $scope.username = null;
     $scope.password = null;
     $scope.loginModal.hide();
  });

  $scope.$on('event:auth-login-failed', function(e, status) {
    var error = "Login failed.";
    if (status == 401) {
      error = "Invalid Username or Password.";
    }
    $scope.message = error;
  });

  $scope.$on('event:auth-logout-complete', function() {
    $state.go('app.home', {}, {reload: true, inherit: false});
  });
});

sapristi.controller('LogoutCtrl', function($scope, AuthenticationService) {
    AuthenticationService.logout();
});


/**
 * OnLoad etc
 */

function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

// Cordova is loaded and it is now safe to make calls Cordova methods
function onDeviceReady() {
    // Now safe to use the Cordova API
    //get_contacts();

  if (window.cordova.logger) {
      window.cordova.logger.__onDeviceReady();
  }
  console.log("Ready to log!");
}
