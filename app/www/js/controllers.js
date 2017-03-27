angular.module('ServU')

.controller('MainCtrl', function($scope, $rootScope, $ionicScrollDelegate) {
	
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

.controller('HomeCtrl', function($scope, $http, OpenWeatherConfig, $cordovaMedia, hideHeader) {
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
	
	hideHeader.init();
})

.controller('ProbesCtrl', function($scope, $cordovaCamera, $cordovaDeviceMotion, $cordovaDeviceOrientation, $cordovaDevice, hideHeader) {
	
	ionic.Platform.ready(function(){
	
		$scope.takePicture = function() {
			var options = {
				quality: 75, // Qualité de l'image sauvée, valeur entre 0 et 100
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: Camera.PictureSourceType.CAMERA,
				allowEdit: true,
				encodingType: Camera.EncodingType.JPEG, // Format d'encodage : JPEG ou PNG
				targetWidth: 300, // Largeur de l'image en pixel
				targetHeight: 300, // Hauteur de l'image en pixel
				saveToPhotoAlbum: false // Enregistrer l'image dans l'album photo du device
			};

			$cordovaCamera.getPicture(options).then(function(imageData) {
				$scope.imgURI = "data:image/jpeg;base64," + imageData;
			}, function(err) {
				console.log(err);
			});
		};
	  
		// var $scope.localisation;
	  
		// function getLocalisation(){
			// var onSuccess = function(position) {
				// $scope.localisation = position;
			// };

			// onError Callback receives a PositionError object
			
			// function onError(error) {
				// alert('code: '    + error.code    + '\n' +
					  // 'message: ' + error.message + '\n');
			// };
			
			// var optionsLocalisation = {enableHighAccuracy : true};
			
			// navigator.geolocation.getCurrentPosition(onSuccess, onError, optionsLocalisation);
		// };
		
		function getBattery(){
			window.addEventListener("batterystatus", onBatteryStatus, false);

			function onBatteryStatus(status) {
				$scope.battery = status;
			};
		};
		
		function getAccelerometer(){
			var optionsAccelerometer = { frequency : 1000 };
					
			var watchID = $cordovaDeviceMotion.watchAcceleration(optionsAccelerometer); //temps real on peut aussi avori get current
			
			watchID.then(
				null,
				function onError() {
					alert('onError!');
				},
				function onSuccess(acceleration) {
					$scope.accelerometer = acceleration;
				}
			);
		};
		
		function getOrientation(){
			var optionsOrientation = {
				frequency: 1000,
				filter: true     // if frequency is set, filter is ignored
			}

			var watch = $cordovaDeviceOrientation.watchHeading(optionsOrientation).then(
				null,
				function onError(error) {
					alert('code: '    + error.code    + '\n' +
					  'message: ' + error.message + '\n');
				},
				function(result) {   // updates constantly (depending on frequency value)
					$scope.orientation = result;
				}
			);
		};
		
		$scope.globalization = {};
		function getGlobalization(){
			var globa = {};
			var onSuccess = function (language) {
				$scope.globalization.language = language.value;
			}
			
			var onError = function onError(error) {
				alert('code: '    + error.code    + '\n' +
				'message: ' + error.message + '\n');
			}
			
			navigator.globalization.getPreferredLanguage(onSuccess, onError);
			
			navigator.globalization.getLocaleName(
				function (locale) {$scope.globalization.localName = locale.value;}, //concaténation d'objet
				function () {alert('code: '    + error.code    + '\n' +	'message: ' + error.message + '\n');}
			);
		};
		
		function getNetwork(){
			function checkConnection() {
				var networkState = navigator.connection.type;

				var states = {};
				states[Connection.UNKNOWN]  = 'Unknown connection';
				states[Connection.ETHERNET] = 'Ethernet connection';
				states[Connection.WIFI]     = 'WiFi connection';
				states[Connection.CELL_2G]  = 'Cell 2G connection';
				states[Connection.CELL_3G]  = 'Cell 3G connection';
				states[Connection.CELL_4G]  = 'Cell 4G connection';
				states[Connection.CELL]     = 'Cell generic connection';
				states[Connection.NONE]     = 'No network connection';

				$scope.network = {};
				$scope.network.states = states[networkState];
			}

			checkConnection();
		};
		
		function getBluetooth(){
			$scope.bluetooth = {};
			
			bluetoothSerial.isEnabled(
				function() {
					$scope.bluetooth.enable = true;
				},
				function() {
					$scope.bluetooth.enable = false;
				}
			);
			
			bluetoothSerial.isConnected(
				function() {
					console.log("Bluetooth is connected");
				},
				function() {
					console.log("Bluetooth is *not* connected");
				}
			);
			
		};
		
		function getOthersSensors(){
			if (ionic.Platform.isAndroid()) {// sensor fonctionne uniquement sur android
			//creation de la liste pour plus tard si les noms changes ou si similaire avec ios
				var listSensors = { "proximity" : "PROXIMITY", "ambient_temp" : "AMBIENT_TEMPERATURE", "light" : "LIGHT", "pressure" : "PRESSURE", "humidity" : "RELATIVE_HUMIDITY", "temperature" : "TEMPERATURE"}
				//PROXIMITY
				sensors.enableSensor(listSensors["proximity"]);
				sensors.getState(function(value){$scope.proximity = (value[0] == 0) ? true : false});
				sensors.disableSensor(listSensors["proximity"]);				
				
				//ROOM TEMP
				sensors.enableSensor(listSensors["ambient_temp"]);
				sensors.getState(function(value){$scope.ambient_temp = value[0]});
				sensors.disableSensor(listSensors["ambient_temp"]);				

				//LIGHT
				sensors.enableSensor(listSensors["light"]);
				sensors.getState(function(value){$scope.light = value[0]});
				sensors.disableSensor(listSensors["light"]);

				//PRESSURE
				sensors.enableSensor(listSensors["pressure"]);
				sensors.getState(function(value){$scope.pressure = value[0]});
				sensors.disableSensor(listSensors["pressure"]);
				
				//HUMIDITY
				sensors.enableSensor(listSensors["humidity"]);
				sensors.getState(function(value){$scope.humidity = value[0]});
				sensors.disableSensor(listSensors["humidity"]);
				
				//core temp
				sensors.enableSensor(listSensors["temperature"]);
				sensors.getState(function(value){$scope.temperature = value[0]});
				sensors.disableSensor(listSensors["temperature"]);
				
				$scope.screen_orientation = screen.orientation.type;
				
				
			}
			if (ionic.Platform.isIOS()){
				// TROUVER UN PLUGIN POUR LES SENSORS
			}
			
			$scope.sim = {};
			function successCallback(result) {
				$scope.sim.nbCards = result.cards.length;
				$scope.sim.cards = result.cards;
				$scope.sim.subscriberId = result.subscriberId;
			}
			function errorCallback(error) {
				console.log(error);
			}
				
			window.plugins.sim.hasReadPermission(function successFunc(value){
				if (value){
					window.plugins.sim.getSimInfo(successCallback, errorCallback);
				} else {
					window.plugins.sim.requestReadPermission(function (){window.plugins.sim.getSimInfo(successCallback, errorCallback)}, errorCallback);
				}
			}, errorCallback);
			
			
			$scope.flashlight = {};
			$scope.flashlight.available = false;
			window.plugins.flashlight.available(function(isAvailable) {
				if (isAvailable) {
					$scope.flashlight.available = true;
				} else {
					$scope.flashlight.available = false;
				}
			});
			$scope.flashlight.isActivated = window.plugins.flashlight.isSwitchedOn();
		}
		
		window.addEventListener("orientationchange", function(){
			$scope.screen_orientation = screen.orientation.type;
		});
		
		$scope.refreshProbes = function(){
			// getLocalisation();
			getBattery();
			getAccelerometer();
			getOrientation();
			$scope.device = ionic.Platform.device();
			getGlobalization();
			getNetwork();
			getBluetooth();
			getOthersSensors();
		};
		

		$scope.refreshProbes();

	}, false);
	
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