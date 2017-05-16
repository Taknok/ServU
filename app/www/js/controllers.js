angular.module('ServU')

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, probes, actions, $http, ServUApi, phoneInfo, $interval) {
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
	
		
	// PROBES
	
	let putProbes = function(){
		let vectProbes = probes.getAll();

		for (let i = 0; i < vectProbes.length; i++){				
			if (vectProbes[i].available){
				let data = {};
				if (vectProbes[i].active){
					data = {
						"label" : vectProbes[i].label,
						"active" : vectProbes[i].active,
						"data" : vectProbes[i].value
					};
				} else {
					data = {
						"label" : vectProbes[i].label,
						"active" : vectProbes[i].active,
						"data" : {}
					};
				}
				
				$http.put(ServUApi.url + "/phones/" + phoneInfo.getUuid() + "/probes/" + vectProbes[i].name, data);
			}
		}
		console.log(vectProbes.length, " probes updated");
	};
	
	// ACTIONS
	function actionHandler(){
		console.log("Start actionHandler")
		var url = ServUApi.url + "/phones/" + phoneInfo.getUuid() + "/actionUserToDo";
		$http.get(url).success(function(action) {
			console.log(action);
			if (action.status === "pending"){
				let actionUpdated = actions.trigger(action);
				
				$http.put(ServUApi.url + "/phones/" + phoneInfo.getUuid() + "/actionsUser/" + actionUpdated.id, {"status" : actionUpdated.status});
			}
		});
	}
	
	$interval(function(){
		console.log(phoneInfo.getPosted(), phoneInfo.getUuid() != 0)
		if (phoneInfo.getUuid() != 0 && phoneInfo.getPosted()){
			putProbes();
			actionHandler();
		}
		console.log(">>>> 10s loop <<<<")
	}, 10 * 1000);
		
})

.controller('LoginCtrl', function($scope, AuthService, $ionicPopup, $state, phoneInfo, probes, actions, ServUApi, $http) {
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
					} else if (e.status == 409){
						console.error("Another device has the same uuid :", e);
						phoneInfo.setPosted(true);
					} 
				});
			};
			
			console.log("Phone has been posted : ", phoneInfo.getPosted())
			
			// PROBES POST
			
			let postProbes = function(){
				let vectProbes = probes.getAll();
				
				for (let i = 0; i < vectProbes.length; i++){
					if (vectProbes[i].available){
						let data = {};
						if (vectProbes[i].active){
							data = {
								"name" : vectProbes[i].name,
								"label" : vectProbes[i].label,
								"active" : vectProbes[i].active,
								"data" : vectProbes[i].value
							};
						} else {
							data = {
								"name" : vectProbes[i].name,
								"label" : vectProbes[i].label,
								"active" : vectProbes[i].active,
								"data" : {}
							};
						}
						
						$http.post(ServUApi.url + "/phones/" + phoneInfo.getUuid() + "/probes", data);
					}
				}
			};
			
			// ACTIONS AVAILABLE POST
			
			let postActionAvailable = function(){
				let vectActionsAvailable = actions.getAll();
				
				for (let i = 0; i < vectActionsAvailable.length; i++){
					let data = {
						"name" : vectActionsAvailable[i].name,
						"label": vectActionsAvailable[i].label,
						"enabled": (vectActionsAvailable[i].enable && vectActionsAvailable[i].authorized),
						"description": vectActionsAvailable[i].description,
					};
					
					$http.post(ServUApi.url + "/phones/" + phoneInfo.getUuid() + "/actionsAvailable", data);

				}
			};
			
			
			if (!phoneInfo.getPosted()){
				postPhone();
				probes.checkAvailable();
				postProbes();
				postActionAvailable();
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
	
	probes.onStart();
	
	
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

.controller('HomeCtrl', function($scope, $state, $http, $ionicPopup, ServUApi, AuthService, hideHeader, actions, phoneInfo, probes) {
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
		function successCallback(result) {
		  console.log(result);
		}

		function errorCallback(error) {
		  console.log(error);
		}
		function hasReadPermission() {
			window.plugins.sim.hasReadPermission(successCallback, errorCallback);
		}
		function requestReadPermission() {
			window.plugins.sim.requestReadPermission(successCallback, errorCallback);
		}
		hasReadPermission();
		requestReadPermission();
		console.log(">>>>>>>>>", probes.sim.getAll())
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
	$scope.wifi = probes.wifi.getAll();
	
	$scope.$watch("network.active", function(){
		probes.network.setActive($scope.network.active);
		probes.wifi.setActive($scope.wifi.active);
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
	
	
	hideHeader.init();
})

.controller('ActionsCtrl', function($scope, $http, $cordovaVibration, $cordovaMedia, hideHeader, actions, $ionicPopup) {
	
	$scope.ring = actions.ring;
	$scope.vibrate = actions.vibrate;
	$scope.sms = actions.sms;
	$scope.flashlight = actions.flashlight;

	
	// Demonstration on 2 tap
	
	$scope.testVibrate = function(){
		$cordovaVibration.vibrate(500);
	}
	
	$scope.testRing = function(){
		RingtonePicker.timerPlaySound("content://settings/system/ringtone", 2000);
	}
	
	$scope.testSms = function(){
		$ionicPopup.prompt({
			title: 'Phone Number',
			template: ' ',
			inputType: 'tel',
			inputPlaceholder: ' '
		}).then(function(res) {
			actions.sms.trigger(res, "Test msg from ServU ! <3")
		});


	};
	
	$scope.testFlashlight = function(){
		window.plugins.flashlight.toggle();
	}
	
	// watch the switch
	
	$scope.$watch("ring.enable", function(){
		actions.ring.setActive($scope.ring.enable);
		actions.put($scope.ring);
	})
	$scope.$watch("vibrate.enable", function(){
		actions.vibrate.setActive($scope.vibrate.enable);
		actions.put($scope.vibrate);
	})
	$scope.$watch("sms.enable", function(){
		actions.sms.setActive($scope.sms.enable);
		actions.put($scope.sms);
	})
	$scope.$watch("flashlight.enable", function(){
		actions.flashlight.setActive($scope.flashlight.enable);
		actions.put($scope.flashlight);
	})
	
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