angular.module('ServU')
 
.service('AuthService', function($q, $http, ServUApi) {
	var LOCAL_TOKEN_KEY = 'yourTokenKey';
	var isAuthenticated = false;
	var authToken;

	function loadUserCredentials() {
		var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
		if (token) {
			useCredentials(token);
		}
	}

	function storeUserCredentials(token) {
		window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
		useCredentials(token);
	}

	function useCredentials(token) {
		isAuthenticated = true;
		authToken = token;

		// Set the token as header for your requests!
		$http.defaults.headers.common['X-Access-Token'] = authToken;
	}

	function destroyUserCredentials() {
		authToken = undefined;
		isAuthenticated = false;
		$http.defaults.headers.common.Authorization = undefined;
		window.localStorage.removeItem(LOCAL_TOKEN_KEY);
	}
 
	var register = function(user) {
		return $q(function(resolve, reject) {
		$http.post(ServUApi.url + '/signup', user).then(function(result) { //a faire plus tard
			if (result.data.success) {
				resolve(result.data.msg);
			} else {
			reject(result.data.msg);
			}
		});
		});
	};

	var login = function(user) {
		return $q(function(resolve, reject) {
			$http.post(ServUApi.url + '/login', user).then(function(result) {
				if (result.status == 200) {
					storeUserCredentials(result.data.token);
					resolve(result.data.msg);
				} else {
					reject("");
				}
			}, function(result){
				reject("");
			});
		});
	};

	var logout = function() {
		destroyUserCredentials();
		window.localStorage.removeItem(username);
	};

	var getToken = function(){
		return authToken;
	};
	
	loadUserCredentials();

	return {
		login: login,
		register: register,
		logout: logout,
		isAuthenticated: function() {
			return isAuthenticated;
		},
		getToken: getToken
	};
})