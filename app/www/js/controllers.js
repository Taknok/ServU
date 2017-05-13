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
	
	document.addEventListener('deviceready', function () {
		cordova.plugins.backgroundMode.enable();
		cordova.plugins.backgroundMode.overrideBackButton();
		cordova.plugins.backgroundMode.excludeFromTaskList();
		cordova.plugins.autoStart.enable();
	}, false);
})

.controller('LoginCtrl', function($scope, AuthService, $ionicPopup, $state, phoneInfo, probes, ServUApi, $http) {
	$scope.user = {
		username: '',
		password: ''
	};
 
	$scope.login = function() {
		AuthService.login($scope.user).then(function(msg) {
			phoneInfo.setUsername($scope.user.username);
			
			let postPhone = function(){
				let tmp = probes.device.getValue();
				
				let data = {
					"name": tmp.model,
					"manufacturer": tmp.manufacturer,
					"model": tmp.model,
					"platform": tmp.platform,
					"version": tmp.version,
					"serial": tmp.serial,
					"uuid": phoneInfo.getUuid(),
					"owner": phoneInfo.getUsername()
				}
				
				$http.post(ServUApi.url + "/phones", data).then(function(){
					phoneInfo.setPosted(true);
					console.log("Phone posted");
				}).catch(function(e){
					if (e.status == 400){
						console.error("Wrong format or Owner not found :", e);
						phoneInfo.setPosted(false);
					} else if (e.status == 401){
						console.error("Unauthorized :", e);
						phoneInfo.setPosted(false);
					} else if (e.status == 403){
						console.error("Forbidden :", e);
						phoneInfo.setPosted(false);
					} else if (e.status == 403){
						console.error("Another device has the same uuid :", e);
					} 
				});
			};
			console.log("Phone has been posted : ", phoneInfo.getPosted())
			if (!phoneInfo.getPosted()){
				postPhone();
			}
			
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
		// { text: 'Settings', value: "arg of the fn", fn: $scope.fn1, disabled: true },
		{ text: 'Lock', value: 0, fn: $scope.lock, disabled : false },
		{ text: 'Logout', value: 0, fn: $scope.logout, disabled : false },
		// { text: 'Logout', value: 2, href: "#/logout", disabled : false}
	];

	$scope.lock = function() {
		$state.go('login');
	};
	
	postProbesOnLogin = async function(){
		let tmp = await probes.constructVect();
		$http.post(ServUApi.url + "/phone/" + phoneInfo.getUuid() + "/probes", tmp);
	};
	// postProbesOnLogin(); //poste a chaque fois que l'on se log, pas tres opti pour le moment mais fonctionne
	
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
		
		var url = ServUApi.url + "/phone/" + phoneInfo.getUuid() + "/actionUser/" + action.actionId;
		var data = [{
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
		var url = ServUApi.url + "/phone/" + phoneInfo.getUuid() + "/actionUserToDo";
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
	
	// $interval(function(){
		// if (phoneInfo.getUuid() != 0){
			// getActions();
		// }
	// }, 5 * 1000);
	
	
	
	
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

.controller('HomeCtrl', function($scope, $state, $http, $ionicPopup, ServUApi, AuthService, hideHeader, actions, $interval) {
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
	
		$scope.test = function(){
cordova.plugins.backgroundMode.moveToBackground();
		$interval(function(){
			console.log(cordova.plugins.backgroundMode.isActive())
		},2000)
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
	$scope.screenOrientation = probes.screenOrientation.getAll();
	$scope.device = probes.device.getAll();
	
	$scope.$watch("network.active", function(){
		probes.network.setActive($scope.network.active);
	})
	$scope.$watch("bluetooth.active", function(){
		probes.bluetooth.setActive($scope.bluetooth.active);
	})
	// $scope.$watch("localisation.active", function(){
		// probes.localisation.setActive($scope.localisation.active);
	// })
	$scope.$watch("battery.active", function(){
		probes.battery.setActive($scope.battery.active);
	})
	$scope.$watch("sim.active", function(){
		probes.sim.setActive($scope.sim.active);
	})
	$scope.$watch("flashlight.active", function(){
		probes.flashlight.setActive($scope.flashlight.active);
	})
	$scope.$watch("screenOrientation.active", function(){
		probes.screenOrientation.setActive($scope.screenOrientation.active);
	})
	$scope.$watch("device.active", function(){
		probes.device.setActive($scope.device.active);
	})
	
	$scope.refreshProbes = function(){
		$scope.network = probes.network.getValue();
		$scope.bluetooth = probes.bluetooth.getValue();
		// $scope.localisation = probes.localisation.getValue();
		$scope.battery = probes.battery.getValue();
		$scope.sim = probes.sim.getValue();
		$scope.flashlight = probes.flashlight.getValue();
		$scope.screenOrientation = probes.screenOrientation.getValue();
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