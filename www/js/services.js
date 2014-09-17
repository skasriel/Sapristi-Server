var sapristi = angular.module('sapristi.services', ['http-auth-interceptor']);

sapristi.value('baseURL', 'http://localhost:3000');

/*sapristi.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
    { id: 0, name: 'Gwen', availability: "eager", avatar: "avatars/gwen.jpg" },
    { id: 1, name: 'John', availability: "available", avatar: "avatars/john.jpg" },
    { id: 2, name: 'Ced', availability: "busy", avatar: "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xaf1/v/t1.0-1/c0.1.160.160/p160x160/1897669_10153846379225405_2089391941_n.jpg?oh=93f73259b214f3952558453a9748b41c&oe=5461ABBF&__gda__=1416617756_0d681713e3c4866a1a76dc0714e2c66b" },
    { id: 3, name: 'Reza', availability: "unknown", avatar: "avatars/reza.jpg" }
  ];

  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      return friends[friendId];
    }

  }
});*/

sapristi.factory('AuthenticationService', function($rootScope, $http, authService, $httpBackend, $state, baseURL) {
  var service = {
    register: function(user) {
      $http.post(baseURL+'/api/auth/register', { username: user.username, password: user.password, mobileNumber: user.mobileNumber }, { ignoreAuthModule: true })
      .success(function (data, status, headers, config) {
        $http.defaults.headers.common.Authorization = data.authorizationToken;  // Step 1
        window.localStorage.setItem("username", user.username);
        window.localStorage.setItem("authorizationToken", data.authorizationToken);
        $state.go('register.add-friends'); // Go to the next step of reg (add friends page)
      })
      .error(function (data, status, headers, config) {
        alert("unable to register user: "+user+" data="+data);
      });
    },

    login: function(user) {
      $http.post(baseURL+'/api/auth/login', { user: user }, { ignoreAuthModule: true })
      .success(function (data, status, headers, config) {
        alert("successful login: "+data);
    	  $http.defaults.headers.common.Authorization = data.authorizationToken;  // Step 1

    	  // Need to inform the http-auth-interceptor that
        // the user has logged in successfully.  To do this, we pass in a function that
        // will configure the request headers with the authorization token so
        // previously failed requests(aka with status == 401) will be resent with the
        // authorization token placed in the header
        authService.loginConfirmed(data, function(config) {  // Step 2 & 3
          alert("setting HTTP headers for future requests");
          config.headers.Authorization = data.authorizationToken;
          return config;
        });
      })
      .error(function (data, status, headers, config) {
        $rootScope.$broadcast('event:auth-login-failed', status);
      });
    },
    logout: function(user) {
      $http.post(baseURL+'/api/auth/logout', {}, { ignoreAuthModule: true })
      .finally(function(data) {
        delete $http.defaults.headers.common.Authorization;
        $rootScope.$broadcast('event:auth-logout-complete');
      });
    },
    loginCancelled: function() {
      authService.loginCancelled();
    }
  };
  return service;
});
