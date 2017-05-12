angular.module('ServU')

.factory("hideHeader",[ "$rootScope",  function($rootScope){ //currently no used just exemple
	return {
		init: function(){
			$rootScope.slideHeader = false;
			$rootScope.slideHeaderPrevious = 0;
		}
	};
}])

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
	return {
		responseError: function (response) {
		$rootScope.$broadcast({
			401: AUTH_EVENTS.notAuthenticated,
		}[response.status], response);
		return $q.reject(response);
		}
	};
})

.factory("actions", [ "$cordovaVibration", "$cordovaSms", function($cordovaVibration, $cordovaSms){
	var options = {
		replaceLineBreaks: false, // true to replace \n by a new line, false by default
		android: {
			intent: '' // send SMS with the native android SMS messaging
			//intent: '' // send SMS without open any other app
			//intent: 'INTENT' // send SMS inside a default SMS app
		}
	}
	
	var ring = function(time){
		RingtonePicker.timerPlaySound("content://settings/system/ringtone", time);
	}
	
	var vibrate = function(time){
		$cordovaVibration.vibrate(time);
	}
	
	var sms = function(num, msg){
		$cordovaSms.send(num, msg, options).then(function() {
				console.log('Send sms success');
			}, function(error) {
				console.error('Send sms error');
			}
		);
	};
	
	return {
		ring: ring,
		vibrate: vibrate,
		sms: sms
	};
}])

.factory("phoneInfo", [ function(){
	var _uuid = 0;
	var _username = "Paul";
	return {
		setUuid: function(uuid){
			_uuid = uuid;
		},
		getUuid: function(){
			return _uuid;
		},setUsername: function(username){
			_username = username;
		},
		getUsername: function(){
			return _username;
		}
	};
}])

.factory("probes", [ "$cordovaDeviceMotion", "$cordovaDeviceOrientation", "phoneInfo",  function($cordovaDeviceMotion, $cordovaDeviceOrientation, phoneInfo){
	var onStartDone = false;
	var permanentStorage = window.localStorage;

	
	var localisation = {};
	var battery = {};
	// var orientation;
	// var globalization = {};
	var network = {};
	var bluetooth = {};
	var sim = {};
	var flashlight = {};
	var screen_orientation = {};
	var device = {};
	
	
	// active is the choice of user in probes tab
	// localisation.active = false;
	// battery.active = false;
	// orientation.active = false;
	// globalization.active = false;
	// network.active = true;
	// bluetooth.active = false;
	// sim.active = false;
	// flashlight.active = false;
	// screen_orientation.active = false;
	// device.active = false;
	
	function load(){
		localisation.active = ('true' == permanentStorage.getItem("localisation.active"));
		battery.active = ('true' == permanentStorage.getItem("battery.active"));
		// orientation.active = ('true' == permanentStorage.getItem("orientation.active"));
		// globalization.active = ('true' == permanentStorage.getItem("globalization.active"));
		network.active = ('true' == permanentStorage.getItem("network.active"));
		bluetooth.active = ('true' == permanentStorage.getItem("bluetooth.active"));
		sim.active = ('true' == permanentStorage.getItem("sim.active"));
		flashlight.active = ('true' == permanentStorage.getItem("flashlight.active"));
		screen_orientation.active = ('true' == permanentStorage.getItem("screen_orientation.active"));
		device.active = ('true' == permanentStorage.getItem("device.active"));
		
		localisation.posted = ('true' == permanentStorage.getItem("localisation.posted"));
		battery.posted = ('true' == permanentStorage.getItem("battery.posted"));
		// orientation.posted = ('true' == permanentStorage.getItem("orientation.posted"));
		// globalization.posted = ('true' == permanentStorage.getItem("globalization.posted"));
		network.posted = ('true' == permanentStorage.getItem("network.posted"));
		bluetooth.posted = ('true' == permanentStorage.getItem("bluetooth.posted"));
		sim.posted = ('true' == permanentStorage.getItem("sim.posted"));
		flashlight.posted = ('true' == permanentStorage.getItem("flashlight.posted"));
		screen_orientation.posted = ('true' == permanentStorage.getItem("screen_orientation.posted"));
		device.posted = ('true' == permanentStorage.getItem("device.posted"));
	}
	load();
	
	function checkBool(bool){
		if(typeof(bool) != "boolean"){
		  throw("Set not boolean");
		}
	}
	
	var setActive = function(probe, bool){
		checkBool(bool);
		switch(probe){
			case "localisation":
				localisation.active = bool;
				permanentStorage.setItem("localisation.active", localisation.active);
				break;
			case "battery":
				battery.active = bool;
				permanentStorage.setItem("battery.active", battery.active);
				break;
			// case "orientation":
				// orientation.active = bool;
				// permanentStorage.setItem("orientation.active", orientation.active);
				// break;
			// case "globalization":
				// globalization.active = bool;
				// permanentStorage.setItem("globalization.active", globalization.active);
				// break;
			case "network":
				network.active = bool;
				permanentStorage.setItem("network.active", network.active);
				break;
			case "bluetooth":
				bluetooth.active = bool;
				permanentStorage.setItem("bluetooth.active", bluetooth.active);
				break;
			case "sim":
				sim.active = bool;
				permanentStorage.setItem("sim.active", sim.active);
				break;
			case "flashlight":
				flashlight.active = bool;
				permanentStorage.setItem("flashlight.active", flashlight.active);
				break;
			case "screen_orientation":
				screen_orientation.active = bool;
				permanentStorage.setItem("screen_orientation.active", screen_orientation.active);
				break;
			case "device":
				device.active = bool;
				permanentStorage.setItem("device.active", device.active);
				break;
			default:
				throw("Unknow probe setActive");
		}
	}
	
	// available is detected by phone if this probe is availabl on this phone (change)
	localisation.available = true;
	battery.available = true;
	// orientation.available = true;
	// globalization.available = true;
	network.available = true;
	bluetooth.available = true;
	sim.available = true;
	flashlight.available = true;
	screen_orientation.available = true;
	device.available = true;
	
	function setAvailable(probe, bool){
		checkBool(bool);
		switch(probe){
			case "localisation":
				localisation.available = bool;
				break;
			case "battery":
				battery.available = bool;
				break;
			// case "orientation":
				// orientation.available = bool;
				// break;
			// case "globalization":
				// globalization.available = bool;
				// break;
			case "network":
				network.available = bool;
				break;
			case "bluetooth":
				bluetooth.available = bool;
				break;
			case "sim":
				sim.available = bool;
				break;
			case "flashlight":
				flashlight.available = bool;
				break;
			case "screen_orientation":
				screen_orientation.available = bool;
				break;
			case "device":
				device.available = bool;
				break;
			default:
				throw("Unknow probe setAvailable");
		}
	}
	
	// available is detected by phone if this probe is availabl on this phone (change)
	localisation.posted = false;
	battery.posted = false;
	// orientation.posted = false;
	// globalization.posted = false;
	network.posted = false;
	bluetooth.posted = false;
	sim.posted = false;
	flashlight.posted = false;
	screen_orientation.posted = false;
	device.posted = false;
	
	function setPosted(probe, bool){
		checkBool(bool);
		switch(probe){
			case "localisation":
				localisation.posted = bool;
				permanentStorage.setItem("localisation.posted", localisation.posted);
				break;
			case "battery":
				battery.posted = bool;
				permanentStorage.setItem("battery.posted", battery.posted);
				break;
			// case "orientation":
				// orientation.posted = bool;
				// permanentStorage.setItem("orientation.posted", orientation.posted);
				// break;
			// case "globalization":
				// globalization.posted = bool;
				// permanentStorage.setItem("globalization.posted", globalization.posted);
				// break;
			case "network":
				network.posted = bool;
				permanentStorage.setItem("network.posted", network.posted);
				break;
			case "bluetooth":
				bluetooth.posted = bool;
				permanentStorage.setItem("bluetooth.posted", bluetooth.posted);
				break;
			case "sim":
				sim.posted = bool;
				permanentStorage.setItem("sim.posted", sim.posted);
				break;
			case "flashlight":
				flashlight.posted = bool;
				permanentStorage.setItem("flashlight.posted", flashlight.posted);
				break;
			case "screen_orientation":
				screen_orientation.posted = bool;
				permanentStorage.setItem("screen_orientation.posted", screen_orientation.posted);
				break;
			case "device":
				device.posted = bool;
				permanentStorage.setItem("device.posted", device.posted);
				break;
			default:
				throw("Unknow probe setPosted");
		}
	}
	
	battery.value = {};
	screen_orientation.value = {}
	var onStart = function(){
		console.log("onStart begin");
		if (!onStartDone){
			window.addEventListener("batterystatus", function(status){
				battery.value = status;
			}, false);

			
			window.addEventListener("orientationchange", function(){
				screen_orientation.value = screen.orientation.type;
			});
			
			getDevice()
			console.log(phoneInfo.getUuid())
			
			console.log("onStart done");
			onStartDone = true;
		}
	}
  
	var getLocalisation = function(){
		var onSuccess = function(position) {
			localisation.value = position;
		};

		function onError(error) {
			console.log('localisation : code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
		};
		
		var optionsLocalisation = {enableHighAccuracy : true};
		navigator.geolocation.getCurrentPosition(onSuccess, onError, optionsLocalisation);
		
		return localisation.value;
	};
	
	var getBattery = function(){ //oui on pourrait mettre directement la ligne dans l'object a la fin mais pour plus propre je garde get[Probe]
		window.addEventListener("batterystatus", function(status){
			battery.value = status;
		}, false);
		return battery.value;
	};
	
	// function getAccelerometer(){
		// var optionsAccelerometer = { frequency : 1000 };
		// var watchID = $cordovaDeviceMotion.watchAcceleration(optionsAccelerometer); //temps real on peut aussi avori get current
		
		// watchID.then(
			// null,
			// function onError() {
				// alert('onError!');
			// },
			// function onSuccess(acceleration) {
				// $scope.accelerometer = acceleration;
			// }
		// );
	// };
	
	// function getOrientation(){
		// var optionsOrientation = {
			// frequency: 1000,
			// filter: true     // if frequency is set, filter is ignored
		// }

		// var watch = $cordovaDeviceOrientation.watchHeading(optionsOrientation).then(
			// null,
			// function onError(error) {
				// console.log('getOrientation : code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
			// },
			// function(result) {   // updates constantly (depending on frequency value)
				// orientation.value = result;
			// }
		// );
		// return orientation.value;
	// };

	// globalization.value = {}; //outside of get cos initialisation
	// function getGlobalization(){
		// var onSuccess = function (language) {
			// globalization.value.language = language.value;
		// }
		
		// var onError = function onError(error) {
			// console.log('getGlobalization > getPreferredLanguage code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
		// }
		
		// navigator.globalization.getPreferredLanguage(onSuccess, onError);
		
		// navigator.globalization.getLocaleName(
			// function (locale) {globalization.value.localName = locale.value;}, //concaténation d'objet
			// function () {console.log('getGlobalization > getLocalName code: ' + error.code + '\n' +	'message: ' + error.message + '\n');}
		// );
	// };
	
	network.value = {};
	var getNetwork = function(){
		ionic.Platform.ready(function(getNetwork){ 
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

				network.value.state = states[networkState];
			}

			checkConnection();
			//add here get ssid etc
			
		}, false);
		return network.value;
	};
	
	bluetooth.value = {};
	var getBluetooth = function(){
		ionic.Platform.ready(function(getBluetooth){ 
			
			bluetoothSerial.isEnabled(
				function() {
					bluetooth.value.enable = true;
				},
				function() {
					bluetooth.value.enable = false;
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
			
		}, false);
		return bluetooth.value;
	};
	
	sim.value = {};
	var getSim = function(){
		ionic.Platform.ready(function(){ 
		
			function successCallback(result) {
				sim.value.nbCards = result.cards.length;
				sim.value.cards = result.cards;
				sim.value.subscriberId = result.subscriberId;
			}
			function errorCallback(error) {
				console.log(error);
			}
				
			window.plugins.sim.hasReadPermission(function successFunc(value){
				if (value){
					window.plugins.sim.getSimInfo(successCallback, errorCallback);
				} else {
					window.plugins.sim.requestReadPermission(
						function(){
							setAvailable("sim", true);
							window.plugins.sim.getSimInfo(successCallback, errorCallback)
						},
						function(){
							setAvailable("sim", false);
						}
					);
				}
			}, errorCallback);
			
		}, false);

		return sim.value;
	};
	
	flashlight.value = {};
	var getFlashlight = function(){
		ionic.Platform.ready(function(){ 
		
			window.plugins.flashlight.available(function(isAvailable) {
				if (isAvailable) {
					setAvailable("flashlight", true);
				} else {
					setAvailable("flashlight", false);
				}
			});
		
			if (flashlight.available){
				flashlight.value.isActivated = window.plugins.flashlight.isSwitchedOn();
			}
		
		}, false);
		
		return flashlight.value;
	};
	
	var getOthersSensors = function(){
		// if (ionic.Platform.isAndroid()) {// sensor fonctionne uniquement sur android
		// creation de la liste pour plus tard si les noms changes ou si similaire avec ios
			// var listSensors = { "proximity" : "PROXIMITY", "ambient_temp" : "AMBIENT_TEMPERATURE", "light" : "LIGHT", "pressure" : "PRESSURE", "humidity" : "RELATIVE_HUMIDITY", "temperature" : "TEMPERATURE"}
			// PROXIMITY
			// sensors.enableSensor(listSensors["proximity"]);
			// sensors.getState(function(value){$scope.proximity = (value[0] == 0) ? true : false});
			// sensors.disableSensor(listSensors["proximity"]);				
			
			// ROOM TEMP
			// sensors.enableSensor(listSensors["ambient_temp"]);
			// sensors.getState(function(value){$scope.ambient_temp = value[0]});
			// sensors.disableSensor(listSensors["ambient_temp"]);				

			// LIGHT
			// sensors.enableSensor(listSensors["light"]);
			// sensors.getState(function(value){$scope.light = value[0]});
			// sensors.disableSensor(listSensors["light"]);

			// PRESSURE
			// sensors.enableSensor(listSensors["pressure"]);
			// sensors.getState(function(value){$scope.pressure = value[0]});
			// sensors.disableSensor(listSensors["pressure"]);
			
			// HUMIDITY
			// sensors.enableSensor(listSensors["humidity"]);
			// sensors.getState(function(value){$scope.humidity = value[0]});
			// sensors.disableSensor(listSensors["humidity"]);
			
			// core temp
			// sensors.enableSensor(listSensors["temperature"]);
			// sensors.getState(function(value){$scope.temperature = value[0]});
			// sensors.disableSensor(listSensors["temperature"]);
			
			// $scope.screen_orientation = screen.orientation.type;
			
			
		// }
		if (ionic.Platform.isIOS()){
			// TROUVER UN PLUGIN POUR LES SENSORS
		}
		
	}
	
	var getScreen_orientation = function(){
		return screen_orientation.value;
	}
	
	var getDevice = function(){
		device.value = ionic.Platform.device();
		phoneInfo.setUuid(device.value.uuid);
		return device.value;
	}
	
	// refreshProbes = function(){
		// getLocalisation();
		// getBattery();
		// getAccelerometer();
		// getOrientation();
		// getDevice();
		// getGlobalization();
		// getNetwork();
		// getBluetooth();
		// getOthersSensors();			
	// };
	
	var constructVect = async function(){
		names = [
			"network",
			"bluetooth",
			// "localisation",
			"battery",
			"screen_orientation",
			"flashlight",
			"sim",
			"device"
		];
		
		actives = [
			network.active,
			bluetooth.active,
			// localisation.active,
			battery.active,
			screen_orientation.active,
			flashlight.active,
			sim.active,
			device.active
		];
		
		values = [
			network.value,
			bluetooth.value,
			// localisation.value,
			battery.value,
			screen_orientation.value,
			flashlight.value,
			sim.value,
			device.value
		];
		
		res = [];
		for(var i = 0; i < names.length; i++){
			res.push({
				"name": names[i],
				"active": actives[i],
				"data": values[i]
			});
		}
		return await res;
	};

	return {
		onStart: onStart,
		localisation : {
			getValue: getLocalisation,
			setActive: function(bool){setActive("localisation", bool)},
			getActive: function(){return localisation.active;},
			setAvailable: function(bool){setAvailable("localisation", bool)},
			getAvailable: function(){return localisation.available;},
			setPosted: function(bool){setPosted("flashlight", bool)},
			getPosted: function(){return flashlight.posted;},
			getAll: function(){
				var tmp = {};
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				
				return tmp;
			}
		},
		battery : {
			getValue: getBattery,
			setActive: function(bool){setActive("battery", bool)},
			getActive: function(){return battery.active;},
			setAvailable: function(bool){setAvailable("battery", bool)},
			getAvailable: function(){return battery.available;},
			setPosted: function(bool){setPosted("battery", bool)},
			getPosted: function(){return battery.posted;},
			getAll: function(){
				var tmp = {};
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				
				return tmp;
			}
		},
		// orientation : {
			// getValue: getOrientation(),
			// setActive: function(bool){setActive("orientation", bool)},
			// getActive: function(){return orientation.active;},
			// setAvailable: function(bool){setAvailable("orientation", bool)},
			// getAvailable: function(){return orientation.available;},
			// setPosted: function(bool){setPosted("orientation", bool)},
			// getPosted: function(){return orientation.Posted;}
		// },
		// globalization : {
			// getValue: getGlobalization(),
			// setActive: function(bool){setActive("globalization", bool)},
			// getActive: function(){return globalization.active;},
			// setAvailable: function(bool){setAvailable("globalization", bool)},
			// getAvailable: function(){return globalization.available;},
			// setPosted: function(bool){setPosted("globalization", bool)},
			// getPosted: function(){return globalization.Posted;}
		// },
		network : {
			getValue: getNetwork,
			setActive: function(bool){setActive("network", bool)},
			getActive: function(){return network.active;},
			setAvailable: function(bool){setAvailable("network", bool)},
			getAvailable: function(){return network.available;},
			setPosted: function(bool){setPosted("network", bool)},
			getPosted: function(){return network.posted;},
			getAll: function(){
				var tmp = {};
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				
				return tmp;
			}
		},
		bluetooth : {
			getValue: getBluetooth,
			setActive: function(bool){setActive("bluetooth", bool)},
			getActive: function(){return bluetooth.active;},
			setAvailable: function(bool){setAvailable("bluetooth", bool)},
			getAvailable: function(){return bluetooth.available;},
			setPosted: function(bool){setPosted("bluetooth", bool)},
			getPosted: function(){return bluetooth.posted;},
			getAll: function(){
				var tmp = {};
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				
				return tmp;
			}
		},
		sim : {
			getValue: getSim,
			setActive: function(bool){setActive("sim", bool)},
			getActive: function(){return sim.active;},
			setAvailable: function(bool){setAvailable("sim", bool)},
			getAvailable: function(){return sim.available;},
			setPosted: function(bool){setPosted("sim", bool)},
			getPosted: function(){return sim.posted;},
			getAll: function(){
				var tmp = {};
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				
				return tmp;
			}
		},
		flashlight : {
			getValue: getFlashlight,
			setActive: function(bool){setActive("flashlight", bool)},
			getActive: function(){return flashlight.active;},
			setAvailable: function(bool){setAvailable("flashlight", bool)},
			getAvailable: function(){return flashlight.available;},
			setPosted: function(bool){setPosted("flashlight", bool)},
			getPosted: function(){return flashlight.posted;},
			getAll: function(){
				var tmp = {};
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				
				return tmp;
			}
		},
		screen_orientation : {
			getValue: getScreen_orientation,
			setActive: function(bool){setActive("screen_orientation", bool)},
			getActive: function(){return screen_orientation.active;},
			setAvailable: function(bool){setAvailable("screen_orientation", bool)},
			getAvailable: function(){return screen_orientation.available;},
			setPosted: function(bool){setPosted("screen_orientation", bool)},
			getPosted: function(){return screen_orientation.posted;},
			getAll: function(){
				var tmp = {};
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				
				return tmp;
			}
		},
		device : {
			getValue: getDevice,
			setActive: function(bool){setActive("device", bool)},
			getActive: function(){return device.active;},
			setAvailable: function(bool){setAvailable("device", bool)},
			getAvailable: function(){return device.available;},
			setPosted: function(bool){setPosted("device", bool)},
			getPosted: function(){return device.posted;},
			getAll: function(){
				var tmp = {};
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				
				return tmp;
			}
		},
		setActive : setActive, //repetition de getactive avec les probes
		getAll: function(){
			return [
				this.localisation.getAll(),
				this.battery.getAll(),
				// this.orientation.getAll(),
				// this.globalization.getAll(),
				this.network.getAll(),
				this.bluetooth.getAll(),
				this.sim.getAll(),
				this.flashlight.getAll(),
				this.screen_orientation.getAll(),
				this.device.getAll()
			]
		},
		constructVect: constructVect,
		
		
	};

}])

;



angular.module("ionic").factory("getTabIndex", [ "$rootScope",  function($rootScope){
	var index = -1;
	
	return {
		getTab: function(){
			return index;
		},
		setTab: function(currentIndex){
			index = currentIndex;
			$rootScope.$broadcast('tab:updated', currentIndex);
		}
	};
}]);