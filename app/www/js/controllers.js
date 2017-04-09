angular.module('ServU')

.controller('MainCtrl', function($scope, $http, $rootScope, $ionicScrollDelegate, $interval, ServUConfig, phoneInfo, actions, probes) {

	probes.onStart();
	
	function doAction(action){
		var params = action.data;
		switch(action.action){
			case "flashlight":
			
				break;
			case "vibrate":
				actionFacto.vibrate(params.time);
				action.status = "done";
				//action.timestamp =
				break;
			case "ring":
				actionFacto.vibrate(params.time);
				action.status = "done";
				break;
			default:
				console.log("unknow action " + action.name);
		}
	}
	
	function upSendAction(action){
		
		var url = ServUConfig.searchUrl + "/phone/" + phoneInfo.getUuid() + "/actions_user";
		var data = [{
			"actionId" : action.actionId,
			"status" : action.status
		}]
		// $http.put(url, data);
		
		var url2 = ServUConfig.searchUrl + "/users/" + phoneInfo.getUsername() +"/devices/" + phoneInfo.getUuid() + "/actions/1";
		$http.delete(url2);
	}
	
	
	function getActions() {
		var items = [];
		var url = ServUConfig.searchUrl + "/phone/" + phoneInfo.getUuid() + "/actions_user";
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

.controller('HomeCtrl', function($scope, $http, OpenWeatherConfig, $cordovaMedia, hideHeader, ServUConfig) {
    $scope.search = '';
    $scope.state = false;    
    $scope.weatherData = {
    icon: '',
    main: '',
    city: '',
    description: '',
    temp: ''
    };
		
    $scope.loadWeather = function(search, $event) {
		$scope.keyCode = $event.keyCode;
        if ($event.keyCode === 13) {
            var url = OpenWeatherConfig.searchUrl + search + OpenWeatherConfig.units + OpenWeatherConfig.appid;
            $http.get(url).success(function(data) {
                $scope.weatherData.icon = OpenWeatherConfig.imgUrl + data.weather[0].icon + '.png';
                $scope.weatherData.main = data.weather[0].main;
                $scope.weatherData.city = data.name;
                $scope.weatherData.description = data.weather[0].description;
                $scope.weatherData.temp = data.main.temp;
                $scope.state = true;
            });
        };
    };
	
	ionic.Platform.ready(function(){
		cordova.plugins.autoStart.enable();
		console.log("autostart enable");
	});
	
	
	$scope.flashlightOn = function(){
		console.log($scope.flashlight);
		window.plugins.flashlight.switchOn();
	}
	$scope.flashlightOff = function(){
		window.plugins.flashlight.switchOff();
	}
	

	$scope.ring = function(){
		// RingtonePicker.pickRingtone(function(success){
			// console.log(success);
		// },function(){});
		
		RingtonePicker.timerPlaySound("content://settings/system/ringtone", 2000);
	}
	
	$scope.post = function(){
		
	}
	
	
	hideHeader.init();
})

.controller('ProbesCtrl', function($scope, $http, hideHeader, ServUConfig, phoneInfo, probes) {
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
		
		var data = {
			uuid : phoneInfo.getUuid(),
			"name": phoneInfo.getUsername,
			"manufacturer": "a",
			"model": "a",
			"platform": "a",
			"version": "a",
			"serial": "a",
			"uuid": phoneInfo.getUuid()
		}
		
		var urlPhone = ServUConfig.searchUrl + "/users/" + phoneInfo.getUsername() + "/devices";
		$http.post(urlPhone,);
		
		
		var probe = {
			"name": "network",
			"active": true,
			"data": "false data"
		}
		
		
		var urlProb = ServUConfig.searchUrl + "/phone/" + phoneInfo.getUuid() + "/probes";
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