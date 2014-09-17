// Ionic sapristi App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'sapristi' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'sapristi.services' is found in services.js
// 'sapristi.controllers' is found in controllers.js
angular.module('sapristi', ['ionic', /*'ngMockE2E', */'ngRoute', 'sapristi.controllers', 'sapristi.services'])

.run(function($rootScope, $ionicPlatform, $httpBackend, $http) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) { // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });



})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html",
      controller: 'ShowLoginCtrl'
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.friends', {
      url: '/friends',
      views: {
        'tab-friends': {
          templateUrl: 'templates/tab-friends.html',
          controller: 'FriendsCtrl'
        }
      }
    })
    .state('tab.friend-detail', {
      url: '/friend/:friendId',
      views: {
        'tab-friends': {
          templateUrl: 'templates/friend-detail.html',
          controller: 'FriendDetailCtrl'
        }
      }
    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
        }
      }
    })

    .state('app.logout', {
      url: "/logout",
      views: {
    	   'menuContent' :{
    		   controller: "LogoutCtrl"
    	    }
        }
      })

      ;

  $stateProvider
    .state('register', {
      url: '/register',
      abstract: true,
      templateUrl: "templates/register.html"
    })
    .state('register.enter-mobile-number', {
      url: '/enter-mobile-number',
      views: {
        'register': {
          templateUrl: 'templates/enter-mobile-number.html',
          controller: 'RegisterCtrl'
        }
      }
    })
    .state('register.add-friends', {
      url: '/add-friends',
      views: {
        'register': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
        }
      }
    })
    .state('register.select-friends', {
      url: '/select-friends',
      views: {
        'register': {
          templateUrl: 'templates/select-friends.html',
          controller: 'AccountCtrl'
        }
      }
    })



    ;




  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/tab/friends');
  $urlRouterProvider.otherwise('/register/enter-mobile-number');

});
