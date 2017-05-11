angular.module('ServU')

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
	$scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
		AuthService.logout();
		$state.go('login');
		var alertPopup = $ionicPopup.alert({
			title: 'Session Lost!',
			template: 'Sorry, You have to login again.'
		});
	});
})

.controller('LoginCtrl', function($scope, AuthService, $ionicPopup, $state, phoneInfo) {
	$scope.user = {
		username: '',
		password: ''
	};
 
	$scope.login = function() {
		AuthService.login($scope.user).then(function(msg) {
			phoneInfo.setUsername($scope.user.username);
			$state.go('main');
		}, function(errMsg) {
			var alertPopup = $ionicPopup.alert({
				title: 'Login failed!',
				template: errMsg
			});
		});
	};
})

.controller('RegisterCtrl', function($scope, AuthService, $ionicPopup, $state) {
	$scope.user = {
		name: '',
		password: ''
	};

	$scope.signup = function() {
		AuthService.register($scope.user).then(function(msg) {
			$state.go('login');
			var alertPopup = $ionicPopup.alert({
				title: 'Register success!',
				template: msg
			});
		}, function(errMsg) {
			var alertPopup = $ionicPopup.alert({
				title: 'Register failed!',
				template: errMsg
			});
		});
	};
})

.controller('MainCtrl', function($scope, $http, $rootScope, $ionicScrollDelegate, $interval, $state, ServUApi, phoneInfo, actions, probes) {

	$scope.fn1 = function (isopened) {
		console.log('fn1 opened', isopened);
	};
	
	$scope.settings = [
		{ text: 'Settings', value: "arg of the fn", fn: $scope.fn1, disabled: true },
		{ text: 'Logout', value: 0, fn: $scope.logout, disabled : false },
		{ text: 'Logout', value: 2, href: "#/logout", disabled : true}
	];

	probes.onStart();
	
	function doAction(action){
		var params = action.data;
		console.log(action);
		switch(action.name){
			case "flashlight":
			
				break;
			case "vibrate":
				actions.vibrate(parseInt(params.time));
				action.status = "done";
				//action.timestamp =
				break;
			case "ring":
				actions.ring(parseInt(params.time));
				action.status = "done";
				break;
			default:
				console.log("unknow action " + action.name);
		}
	}
	
	function upSendAction(action){
		
		var url = ServUApi.url + "/phone/" + phoneInfo.getUuid() + "/actions_user";
		var data = [{
			"actionId" : action.actionId,
			"status" : action.status
		}]
		// $http.put(url, data);
		
		//supprime l'action, garder car pour le moment il y a une seule action (action id fixé a 1)
		var url2 = ServUApi.url + "/users/" + phoneInfo.getUsername() +"/devices/" + phoneInfo.getUuid() + "/actions/1";
		console.log(url2);
		$http.delete(url2);
	}
	
	function checkPosted(){ //inutilisée pour le moment
		var url = ServUApi.url + "/phone/" + phoneInfo.getUuid() + "/probes";
		$http.get(url).success(function(probes) {
			
		});
	}
	
	function upSendProbes(){
		var localProbes = probes.getAll();
		var probesToPost = [];
		var probesToPut = [];
		var url = ServUApi.url + "/phone/" + phoneInfo.getUuid() + "/probes";
		
		for(var i = 0; i < localProbes.length; i++){
			var localProbe = localProbes[i];
			if (localProbe.posted){
				probesToPut.push(localProbe);
			} else {
				probesToPost.push(localProbe);
			}
		}
		
		if (probesToPost.length != 0){
			$http.post(url, probesToPost).success(function(probes) {
				console.log(probes);
			});
		}
		if (probesToPut.length != 0){
			$http.put(url, probesToPost).success(function(probes) {
				console.log(probes);
			});
		}
	}
	
	function getActions() {
		var items = [];
		var url = ServUApi.url + "/phone/" + phoneInfo.getUuid() + "/actions_user";
		$http.get(url).success(function(actions) {
			
			for(var i = 0; i < actions.length; i++){
				var action = actions[i];
				if (action.status === "pending"){
					doAction(action);
					console.log(action);
					upSendAction(action);
				}
			}
		});
	}
	
	$scope.up = function(){
		getActions();
	}
	
	$interval(function(){
		if (phoneInfo.getUuid() != 0){
			getActions();
		}
	}, 5 * 1000);
	
	
	
	
	$scope.$on('tab:updated', function(event, index){
		switch(index){
			case 0:
				$scope.pageTitle = "Home";
				break;
			case 1:
				$scope.pageTitle = "Probes";
				break;
			case 2:
				$scope.pageTitle = "Actions";
				break;
			case 3:
				$scope.pageTitle = "Events";
				break;
			default:
				$scope.pageTitle = "Unknow";
		};

		$rootScope.slideHeader = false;
		$rootScope.slideHeaderPrevious = 0;
	});
})

.controller('HomeCtrl', function($scope, $state, $http, $ionicPopup, ServUApi, AuthService, hideHeader) {
	$scope.destroySession = function() {
		AuthService.logout();
	};

	$scope.getInfo = function() {
		$http.get(ServUApi.url + '/memberinfo').then(function(result) { //changer pour mettre les infos de notre user
			$scope.memberinfo = result.data.msg;
		});
	};

	$scope.logout = function() {
		AuthService.logout();
		$state.go('login');
	};
	
	
	hideHeader.init();
})

.controller('ProbesCtrl', function($scope, $http, hideHeader, ServUApi, phoneInfo, probes) {
	$scope.network = probes.network.getAll();
	$scope.bluetooth = probes.bluetooth.getAll();
	// $scope.localisation = probes.localisation.getAll();
	$scope.battery = probes.battery.getAll();
	$scope.sim = probes.sim.getAll();
	$scope.flashlight = probes.flashlight.getAll();
	$scope.screen_orientation = probes.screen_orientation.getAll();
	$scope.device = probes.device.getAll();
	
	$scope.changeActive = function(probe){
		probes.setActive(probe, $scope.network.active);
	}
	
	$scope.refreshProbes = function(){
		$scope.network = probes.network.getValue();
		$scope.bluetooth = probes.bluetooth.getValue();
		// $scope.localisation = probes.localisation.getValue();
		$scope.battery = probes.battery.getValue();
		$scope.sim = probes.sim.getValue();
		$scope.flashlight = probes.flashlight.getValue();
		$scope.screen_orientation = probes.screen_orientation.getValue();
		$scope.device = probes.device.getValue();
		
		
		console.log($scope.testval)
	}

	$scope.username = {};
	$scope.username.value = "Paul"
	$scope.userSet= function(){
		console.log($scope.username);
		phoneInfo.setUsername($scope.username.value);
		console.log(phoneInfo.getUsername());
	}
	
	$scope.createPhone = function(){
		var tel = probes.device.getValue();
		console.log(tel);
		phoneInfo.setUuid(tel.uuid);
		
		var uuid = phoneInfo.getUuid();
		console.log(uuid);
		
		var data = {
			"name": "aaaa",
			"manufacturer": "a",
			"model": "a",
			"platform": "a",
			"version": "a",
			"serial": "a",
			"uuid": uuid
		}
		
		var urlPhone = ServUApi.url + "/users/" + phoneInfo.getUsername() + "/devices";
		$http.post(urlPhone,data);
		
		
		var probe = {
			"name": "network",
			"active": true,
			"data": "false data"
		}
		
		
		var urlProb = ServUApi.url + "/phone/" + phoneInfo.getUuid() + "/probes";
		console.log(urlProb);
		$http.post(urlProb, [probe]);

	}
	
	
	hideHeader.init();
})

.controller('ActionsCtrl', function($scope, $http, $cordovaVibration, $cordovaMedia, hideHeader) {
	$scope.testFlashlight = function(){
		window.plugins.flashlight.toggle();
	}
	
	$scope.testVibrate = function(){
		$cordovaVibration.vibrate(500);
	}
	
	$scope.testRing = function(){	
		console.log('1');
		RingtonePicker.timerPlaySound("content://settings/system/ringtone", 2000);
	}
	
	hideHeader.init();
})

.controller('EventsCtrl', function($scope, $http, hideHeader) {
	var url = 'https://test-e4040.firebaseio.com/items.json';
	$scope.items = getItems();

	$scope.addItem = function() {
		var name = prompt("Que devez-vous acheter?");
		if (name) {
			var postData = {
				"name": name
			};
			$http.post(url, postData).success(function(data) {
				$scope.items = getItems();
			});
		}
	};
	
	$scope.refreshItem = function getItems() {
		var items = [];
		$http.get(url).success(function(data) {
			angular.forEach(data, function(value, key) {
				var name = {name: value.name};
				items.push(name);
			});
		$scope.items = items;
		});
		console.log(getTabIndex.getTab());
	}

	function getItems() {
		var items = [];
		$http.get(url).success(function(data) {
			angular.forEach(data, function(value, key) {
				var name = {name: value.name};
				items.push(name);
			});
		});

		return items;
	}

	hideHeader.init();
	
})

;