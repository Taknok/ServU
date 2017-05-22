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

.factory('socket', ["socketFactory", "ServUApi", function(socketFactory, ServUApi){
	var myIoSocket = io.connect(ServUApi.socket);
	
	mySocket = socketFactory({
		ioSocket: myIoSocket
	});
	
	return mySocket;
}])

.factory("actions", [ "$cordovaVibration", "$cordovaSms", "$http", "ServUApi", "phoneInfo", "$ionicPlatform", "$q", function($cordovaVibration, $cordovaSms, $http, ServUApi, phoneInfo, $ionicPlatform, $q){
	var permanentStorage = window.localStorage;
	
	// ######### DECLARATION #########
	
	var ring = {};
	ring.name = "ring";
	ring.label = "Ring";
	ring.enable = false;
	ring.authorized = true; // true car pas de permi
	ring.description = "Allow to ring durinc X sec";
	ring.permissions = [
	];
	
	var vibrate = {};
	vibrate.name = "vibrate";
	vibrate.label = "Vibrate";
	vibrate.enable = false;
	vibrate.authorized = true;
	vibrate.description = "Allow to ring durinc X sec";
	vibrate.permissions = [];
	
	
	var sms = {};
	sms.name = "sms";
	sms.label = "Sms";
	sms.enable = false;
	sms.authorized = false;
	sms.description = "Allow to send text message to custom destination with custom text";
	$ionicPlatform.ready(function(){ 
	sms.permissions = [
		cordova.plugins.diagnostic.permission.SEND_SMS
	];
	});
	
	var flashlight = {};
	flashlight.name = "flashlight";
	flashlight.label = "Flashlight";
	flashlight.enable = false;
	flashlight.authorized = false;
	flashlight.description = "Use the led on the phone to emit light";
	$ionicPlatform.ready(function(){ 
	flashlight.permissions = [
		cordova.plugins.diagnostic.permission.CAMERA
	];
	});
	
	// USEFULL FUNCTIONS
	
	function load(){
		ring.enable = ('true' == permanentStorage.getItem("ring.enable"));
		vibrate.enable = ('true' == permanentStorage.getItem("vibrate.enable"));
		sms.enable = ('true' == permanentStorage.getItem("sms.enable"));
		flashlight.enable = ('true' == permanentStorage.getItem("flashlight.enable"));
	}
	load();
	
	var purgeAllPendingActions = function(){
		console.log("Start purge all pending actions")
		var answerStatus = 200;
		var url = ServUApi.url + "/phones/" + phoneInfo.getUuid() + "/actionUserToDo";
		
		var recur = function(){
			$http.get(url).then(function(response) {
				if (response.status == 200){
					var action = response.data;	
					console.log(action);
					if (action.status === "pending"){
						let actionUpdated = trigger(action);
						
						$http.put(ServUApi.url + "/phones/" + phoneInfo.getUuid() + "/actionsUser/" + actionUpdated.id, {"status" : actionUpdated.status}).then(function(){
							recur();
						});
					}
				} else if (response.status == 204){
					console.log("End purge all pending actions");
					return;
				} else {
					console.error("Purge all action : ",response);
				}
			});
		};
		recur();
	};
	
	var checkActionAvailable = function(action){
		
		return $q(function(resolve, reject){
			console.log(action);
			if (action == null){
				reject();
				return;
			}
			
			if (action.permissions.length == 0){ //si on a pas de permission a respecter
				action.authorized = true;
				resolve();
			} else {
				ionic.Platform.ready(function(){ 
					cordova.plugins.diagnostic.requestRuntimePermissions(function(statuses){
						var vectBool = [];
						for (var permission in statuses){
							switch(statuses[permission]){
								case cordova.plugins.diagnostic.permissionStatus.GRANTED:
									vectBool.push(true);
									break;
								case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
									vectBool.push(false);
									console.log("Permission to use " + permission + " has not been requested yet");
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED:
									vectBool.push(false);
									console.log("Permission denied to use " + permission);
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
									vectBool.push(false);
									console.log("Permission permanently denied to use " + permission);
									break;
								default:
									vectBool.push(false);
									console.error("Error default status unrecognized: " + statuses[permission]);
									break;
							}
						}
						
						if (vectBool.every(elem => elem == true)){
							action.authorized = true;
							resolve();
						} else {
							action.authorized = false;
							resolve();
						}
					}, function(error){
						console.error("The following error occurred: " + error);
						reject();
					}, action.permissions);
						
				}, false);
			}
		});
	};
	
	function checkBool(bool){
		if(typeof(bool) != "boolean"){
		  throw("Set not boolean");
		}
	}
	
	var put = function(action){
		if (phoneInfo.getUuid() != "undefined"){
			let data = {
				"label": action.label,
				"enabled": action.enable,
				"description": action.description
			};
			$http.put(ServUApi.url + "/phones/" + phoneInfo.getUuid() + "/actionsAvailable/" + action.name, data).then(function(){
				console.log("PUT > " + action.name);
			});
		}
	};
	
	var trigger = function(action){
		var params = action.parameters;
		switch(action.type){ //l'api renvoie un type a la place du name, mais c'est la meme ...
			case ring.name:
				ring.trigger(parseInt(params.time));
				action.status = "done";
				break;
			case vibrate.name:
				vibrate.trigger(parseInt(params.time));
				action.status = "done";
				break;
			case sms.name:
				sms.trigger(params.dest, params.msg);
				action.status = "done";
				break;
			case flashlight.name:
				flashlight.trigger(params.state);
				action.status = "done";
				break;
				
			default:
				console.log("unknow action " + action.name);
		}
		return action;
	};
	
	var setActive = function(action, bool){
		checkBool(bool);
		switch(action){
			case ring.name:
				ring.enable = bool;
				permanentStorage.setItem("ring.enable", ring.enable);
				break;
			case vibrate.name:
				vibrate.enable = bool;
				permanentStorage.setItem("vibrate.enable", vibrate.enable);
				break;
			case sms.name:
				sms.enable = bool;
				permanentStorage.setItem("sms.enable", sms.enable);
				break;
			case flashlight.name:
				flashlight.enable = bool;
				permanentStorage.setItem("flashlight.enable", flashlight.enable);
				break;
			
			default:
				throw("Unknow action action");
		}
	}
	
	ring.setActive = function(bool){
		setActive(ring.name, bool);
	};
	
	vibrate.setActive = function(bool){
		setActive(vibrate.name, bool);
	};
	
	sms.setActive = function(bool){
		setActive(sms.name, bool);
	};
	
	flashlight.setActive = function(bool){
		setActive(flashlight.name, bool);
	};
	
	// ############## DO THE ACTION ##############
	
	var options = {
		replaceLineBreaks: false, // true to replace \n by a new line, false by default
		android: {
			intent: '' // send SMS with the native android SMS messaging
			//intent: '' // send SMS without open any other app
			//intent: 'INTENT' // send SMS inside a default SMS app
		}
	}
	
	ring.trigger = function(time){
		RingtonePicker.timerPlaySound("content://settings/system/ringtone", time);
	}
	
	vibrate.trigger = function(time){
		$cordovaVibration.vibrate(time);
	}
	
	sms.trigger = function(num, msg){
		$cordovaSms.send(num, msg, options).then(function() {
				console.log('Send sms success');
			}, function(error) {
				console.error('Send sms error');
			}
		);
	};
	
	flashlight.trigger = function(state){
		switch(state){
			case "on":
				window.plugins.flashlight.switchOn();
				break;
			case "off":
				window.plugins.flashlight.switchOff();
				break;
			case "toggle":
				window.plugins.flashlight.toggle();
				break;
			
			default:
				console.error("FlashLight : state unknow " + state);
		}
	};
	
	return {
		setActive: setActive,
		ring: ring,
		vibrate: vibrate,
		sms: sms,
		flashlight: flashlight,
		getAll: function(){
			return [
				this.ring,
				this.vibrate,
				this.sms,
				this.flashlight
			]
		},
		put: put,
		trigger: trigger,
		purgeAllPendingActions: purgeAllPendingActions,
		checkAllAvailable: function(){
			var allActions = this.getAll();
			
			return $q(function(resolve, reject){
				var i = 0;
				var recur = function(i){
					checkActionAvailable(allActions[i]).then(function(){
						recur(++i);
					}).catch(function(){
						resolve();
					});
				};
				recur(i);
			});
		}
	};
}])

.factory("phoneInfo", [ function(){
	var permanentStorage = window.localStorage;
	
	// var _uuid = 0;
	// var _username = "Paul";
	var subscribed = false;
	return {
		setUuid: function(uuid){
			permanentStorage.setItem("uuid", uuid);
		},
		getUuid: function(){
			return permanentStorage.getItem("uuid");
		},
		setUsername: function(username){
			permanentStorage.setItem("username", username);
		},
		getUsername: function(){
			return permanentStorage.getItem("username");
		},
		setPosted: function(bool){
			permanentStorage.setItem("phonePosted", bool);
		},
		getPosted: function(){
			return (permanentStorage.getItem("phonePosted") == "true");
		},
		setSubscribed: function(bool){
			subscribed = bool;
		},
		getSubscribed: function(){
			return subscribed;
		}
	};
}])

.factory("probes", [ "$cordovaDeviceMotion", "$cordovaDeviceOrientation", "phoneInfo", "$http", "$ionicPlatform", "$q",  function($cordovaDeviceMotion, $cordovaDeviceOrientation, phoneInfo, $http, $ionicPlatform, $q){
	var onStartDone = false;
	var permanentStorage = window.localStorage;
	
	// ############### DECLARATION ################
	// Network
	var network = {};
	network.name = "network";
	network.label = "Network";
	network.active = false; // recup de memoire plus loin load()
	network.posted = false; // load() recup la mem
	network.available = true;
	network.value = {};
	network.permissions = [];
	
	// Bluetooth
	var bluetooth = {};
	bluetooth.name = "bluetooth";
	bluetooth.label = "Bluetooth";
	bluetooth.active = false;
	bluetooth.posted = false;
	bluetooth.available = true; //true when no permissions
	bluetooth.value = {};
	bluetooth.permissions = [];
	
	// Localisation
	var localisation = {};
	localisation.name = "localisation";
	localisation.label = "GPS";
	localisation.active = false;
	localisation.posted = false;
	localisation.available = false; //false when permissions
	localisation.value = {};
	$ionicPlatform.ready(function(){ 
	localisation.permissions = [
		cordova.plugins.diagnostic.permission.ACCESS_FINE_LOCATION,
		cordova.plugins.diagnostic.permission.ACCESS_COARSE_LOCATION,
	];
	});
	
	// Battery
	var battery = {};
	battery.name = "battery";
	battery.label = "battery";
	battery.active = false;
	battery.posted = false;
	battery.available = true;
	battery.value = {};
	battery.permissions = [];
	
	// FlashLight
	var flashlight = {};
	flashlight.name = "flashlight";
	flashlight.label = "Flashlight";
	flashlight.active = false;
	flashlight.posted = false;
	flashlight.available = false;
	flashlight.value = {};
	$ionicPlatform.ready(function(){ 
	flashlight.permissions = [
		cordova.plugins.diagnostic.permission.CAMERA,
	];
	});
	
	// Device
	var device = {};
	device.name = "device";
	device.label = "Device";
	device.active = false;
	device.posted = false;
	device.available = true;
	device.value = {};
	device.permissions = [];
	
	// SIM
	var sim = {};
	sim.name = "sim";
	sim.label = "Sim Cards";
	sim.active = false;
	sim.posted = false;
	sim.available = false;
	sim.value = {};
	$ionicPlatform.ready(function(){ 
	sim.permissions = [
		cordova.plugins.diagnostic.permission.READ_PHONE_STATE,
	];
	});
	
	// Screen Orientation
	var screenOrientation = {};
	screenOrientation.name = "screenOrientation";
	screenOrientation.label = "Screen Orientation";
	screenOrientation.active = false;
	screenOrientation.posted = false;
	screenOrientation.available = true;
	screenOrientation.value = {};
	screenOrientation.permissions = [];
	
	// WIFI
	var wifi = {};
	wifi.name = "wifi";
	wifi.label = "Wifi";
	wifi.active = false;
	wifi.posted = false;
	wifi.available = true;
	wifi.value = {};
	wifi.permissions = [];
	
	
	
	// var orientation;
	// var globalization = {};	
	// orientation.available = true;
	// globalization.available = true;
	
	
	
	
	
	
	function load(){
		network.active = ('true' == permanentStorage.getItem("network.active"));
		bluetooth.active = ('true' == permanentStorage.getItem("bluetooth.active"));
		localisation.active = ('true' == permanentStorage.getItem("localisation.active"));
		battery.active = ('true' == permanentStorage.getItem("battery.active"));
		flashlight.active = ('true' == permanentStorage.getItem("flashlight.active"));
		device.active = ('true' == permanentStorage.getItem("device.active"));
		sim.active = ('true' == permanentStorage.getItem("sim.active"));
		screenOrientation.active = ('true' == permanentStorage.getItem("screenOrientation.active"));
		wifi.active = ('true' == permanentStorage.getItem("wifi.active"));
		
		// orientation.active = ('true' == permanentStorage.getItem("orientation.active"));
		// globalization.active = ('true' == permanentStorage.getItem("globalization.active"));
		
		
		network.posted = ('true' == permanentStorage.getItem("network.posted"));
		bluetooth.posted = ('true' == permanentStorage.getItem("bluetooth.posted"));
		localisation.posted = ('true' == permanentStorage.getItem("localisation.posted"));
		battery.posted = ('true' == permanentStorage.getItem("battery.posted"));
		flashlight.posted = ('true' == permanentStorage.getItem("flashlight.posted"));
		device.posted = ('true' == permanentStorage.getItem("device.posted"));
		sim.posted = ('true' == permanentStorage.getItem("sim.posted"));
		screenOrientation.posted = ('true' == permanentStorage.getItem("screenOrientation.posted"));
		wifi.posted = ('true' == permanentStorage.getItem("wifi.posted"));
		
		// orientation.posted = ('true' == permanentStorage.getItem("orientation.posted"));
		// globalization.posted = ('true' == permanentStorage.getItem("globalization.posted"));
		
		network.available = ('true' == permanentStorage.getItem("network.available"));
		bluetooth.available = ('true' == permanentStorage.getItem("bluetooth.available"));
		localisation.available = ('true' == permanentStorage.getItem("localisation.available"));
		battery.available = ('true' == permanentStorage.getItem("battery.available"));
		flashlight.available = ('true' == permanentStorage.getItem("flashlight.available"));
		device.available = ('true' == permanentStorage.getItem("device.available"));
		sim.available = ('true' == permanentStorage.getItem("sim.available"));
		screenOrientation.available = ('true' == permanentStorage.getItem("screenOrientation.available"));
		wifi.available = ('true' == permanentStorage.getItem("wifi.available"));
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
			case "network":
				network.active = bool;
				permanentStorage.setItem("network.active", network.active);
				break;
			case "bluetooth":
				bluetooth.active = bool;
				permanentStorage.setItem("bluetooth.active", bluetooth.active);
				break;
			case "localisation":
				localisation.active = bool;
				permanentStorage.setItem("localisation.active", localisation.active);
				break;
			case "battery":
				battery.active = bool;
				permanentStorage.setItem("battery.active", battery.active);
				break;
			case "flashlight":
				flashlight.active = bool;
				permanentStorage.setItem("flashlight.active", flashlight.active);
				break;
			case "device":
				device.active = bool;
				permanentStorage.setItem("device.active", device.active);
				break;
			case "sim":
				sim.active = bool;
				permanentStorage.setItem("sim.active", sim.active);
				break;
			case "screenOrientation":
				screenOrientation.active = bool;
				permanentStorage.setItem("screenOrientation.active", screenOrientation.active);
				break;
			case "wifi":
				wifi.active = bool;
				permanentStorage.setItem("wifi.active", wifi.active);
				break;
			
			// case "orientation":
				// orientation.active = bool;
				// permanentStorage.setItem("orientation.active", orientation.active);
				// break;
			// case "globalization":
				// globalization.active = bool;
				// permanentStorage.setItem("globalization.active", globalization.active);
				// break;
			
			default:
				throw("Unknow probe setActive");
		}
	}
	
	
	function setPosted(probe, bool){
		checkBool(bool);
		switch(probe){
			case "network":
				network.posted = bool;
				permanentStorage.setItem("network.posted", network.posted);
				break;
			case "bluetooth":
				bluetooth.posted = bool;
				permanentStorage.setItem("bluetooth.posted", bluetooth.posted);
				break;
			case "localisation":
				localisation.posted = bool;
				permanentStorage.setItem("localisation.posted", localisation.posted);
				break;
			case "battery":
				battery.posted = bool;
				permanentStorage.setItem("battery.posted", battery.posted);
				break;
			case "flashlight":
				flashlight.posted = bool;
				permanentStorage.setItem("flashlight.posted", flashlight.posted);
				break;
			case "device":
				device.posted = bool;
				permanentStorage.setItem("device.posted", device.posted);
				break;
			case "sim":
				sim.posted = bool;
				permanentStorage.setItem("sim.posted", sim.posted);
				break;
			case "screenOrientation":
				screenOrientation.posted = bool;
				permanentStorage.setItem("screenOrientation.posted", screenOrientation.posted);
				break;
			case "wifi":
				wifi.posted = bool;
				permanentStorage.setItem("wifi.posted", wifi.posted);
				break;
				
			// case "orientation":
				// orientation.posted = bool;
				// permanentStorage.setItem("orientation.posted", orientation.posted);
				// break;
			// case "globalization":
				// globalization.posted = bool;
				// permanentStorage.setItem("globalization.posted", globalization.posted);
				// break;

			default:
				throw("Unknow probe setPosted");
		}
	}
	

	function setAvailable(probe, bool){
		checkBool(bool);
		switch(probe){
			case "network":
				network.available = bool;
				permanentStorage.setItem("network.available", network.available);
				break;
			case "bluetooth":
				bluetooth.available = bool;
				permanentStorage.setItem("bluetooth.available", bluetooth.available);
				break;
			case "localisation":
				localisation.available = bool;
				permanentStorage.setItem("localisation.available", localisation.available);
				break;
			case "battery":
				battery.available = bool;
				permanentStorage.setItem("battery.available", battery.available);
				break;
			case "flashlight":
				flashlight.available = bool;
				permanentStorage.setItem("flashlight.available", flashlight.available);
				break;
			case "device":
				device.available = bool;
				permanentStorage.setItem("device.available", device.available);
				break;
			case "sim":
				sim.available = bool;
				permanentStorage.setItem("sim.available", sim.available);
				break;
			case "screenOrientation":
				screenOrientation.available = bool;
				permanentStorage.setItem("screenOrientation.available", screenOrientation.available);
				break;
			case "wifi":
				wifi.available = bool;
				permanentStorage.setItem("wifi.available", wifi.available);
				break;
				
			// case "orientation":
				// orientation.available = bool;
				// break;
			// case "globalization":
				// globalization.available = bool;
				// break;

			default:
				throw("Unknow probe setAvailable");
		}
	}
	

	var onStart = function(){
		console.log("onStart Probes begin");
		if (!onStartDone){
			
			getDevice();
			console.log(phoneInfo.getUuid());
			
			window.addEventListener("batterystatus", function(status){
				battery.value = status;
			}, false);

			
			window.addEventListener("orientationchange", function(){
				screenOrientation.value = screen.orientation.type;
			});
			
			onStartDone = true;
			console.log("onStart Probes done");
		}
	}
	
	
	var checkProbeAvailable = function(probe){
		
		return $q(function(resolve, reject){
			console.log(probe);
			if (probe == null){
				reject();
				return;
			}
			
			if (probe.permissions.length == 0){ //si on a pas de permission a respecter
				setAvailable(probe.name, true);
				resolve();
			} else {
				ionic.Platform.ready(function(){ 
					cordova.plugins.diagnostic.requestRuntimePermissions(function(statuses){
						var vectBool = [];
						for (var permission in statuses){
							switch(statuses[permission]){
								case cordova.plugins.diagnostic.permissionStatus.GRANTED:
									vectBool.push(true);
									break;
								case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
									vectBool.push(false);
									console.log("Permission to use " + permission + " has not been requested yet");
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED:
									vectBool.push(false);
									console.log("Permission denied to use " + permission);
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
									vectBool.push(false);
									console.log("Permission permanently denied to use " + permission);
									break;
								default:
									vectBool.push(false);
									console.error("Error default status unrecognized: " + statuses[permission]);
									break;
							}
						}
						console.log("zz", vectBool);
						console.log("ee", probe);
						if (vectBool.every(elem => elem == true)){
							setAvailable(probe.name, true);
							resolve();
						} else {
							setAvailable(probe.name, false);
							resolve();
						}
					}, function(error){
						console.error("The following error occurred: " + error);
						reject();
					}, probe.permissions);
						
				}, false);
			}
		});
	};
	
	
	
	
	
	
	// ############# GET VALUES ###############
	
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
	
	
	var getBluetooth = function(){
		ionic.Platform.ready(function(getBluetooth){ 
			
			bluetoothSerial.isEnabled(
				function() {
					bluetooth.value.isEnable = true;
				},
				function() {
					bluetooth.value.isEnable = false;
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
	
	
	var getLocalisation = function(){
		if (localisation.available){
			
			var onSuccess = function(position) {
				localisation.value = {};

				localisation.value.lat = position.coords.latitude;
				localisation.value.long = position.coords.longitude;
				localisation.value.timestamp = position.timestamp;
			};

			function onError(error) {
				console.error('localisation : code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
			};
			
			var optionsLocalisation = {enableHighAccuracy : true};
			navigator.geolocation.getCurrentPosition(onSuccess, onError, optionsLocalisation);

			return localisation.value;
		} else {

			return {};
		}
	};
	
	
	var getBattery = function(){ //oui on pourrait mettre directement la ligne dans l'object a la fin mais pour plus propre je garde get[Probe]
		window.addEventListener("batterystatus", function(status){
			battery.value = status;
		}, false);
		return battery.value;
	};
	
	
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
	
	
	var getDevice = function(){
		device.value = ionic.Platform.device();
		phoneInfo.setUuid(device.value.uuid);
		return device.value;
	};
	
	
	var getSim = function(){
		if (sim.available == true){
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
		}
	};
	
	
	var getscreenOrientation = function(){
		return screenOrientation.value;
	}


	var getWifi = function() {
		ionic.Platform.ready(function(){ 
			cordova.plugins.diagnostic.isWifiEnabled(function(enabled){
				wifi.value.isEnable = ( true == enabled );
				
			}, function(error){
				console.error("Wifi : The following error occurred: "+error);
			});
		}, false);
		
		return wifi.value;
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
			
			// $scope.screenOrientation = screen.orientation.type;
			
			
		// }
		if (ionic.Platform.isIOS()){
			// TROUVER UN PLUGIN POUR LES SENSORS
		}
		
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
	
	
	return {
		onStart: onStart,
		setActive : setActive,
		network : {
			getValue: getNetwork,
			getName: function(){return network.name;},
			getLabel: function(){return network.label;},
			setActive: function(bool){setActive("network", bool)},
			getActive: function(){return network.active;},
			setAvailable: function(bool){setAvailable("network", bool)},
			getAvailable: function(){return network.available;},
			setPosted: function(bool){setPosted("network", bool)},
			getPosted: function(){return network.posted;},
			getPermissions: function(){return network.permissions;},
			getAll: function(){
				var tmp = {};
				tmp.name = this.getName();
				tmp.label = this.getLabel();
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				tmp.permissions = this.getPermissions();
				
				return tmp;
			}
		},
		bluetooth : {
			getValue: getBluetooth,
			getName: function(){return bluetooth.name;},
			getLabel: function(){return bluetooth.label;},
			setActive: function(bool){setActive("bluetooth", bool)},
			getActive: function(){return bluetooth.active;},
			setAvailable: function(bool){setAvailable("bluetooth", bool)},
			getAvailable: function(){return bluetooth.available;},
			setPosted: function(bool){setPosted("bluetooth", bool)},
			getPosted: function(){return bluetooth.posted;},
			getPermissions: function(){return bluetooth.permissions;},
			getAll: function(){
				var tmp = {};
				tmp.name = this.getName();
				tmp.label = this.getLabel();
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				tmp.permissions = this.getPermissions();
				
				return tmp;
			}
		},
		localisation : {
			getValue: getLocalisation,
			getName: function(){return localisation.name;},
			getLabel: function(){return localisation.label;},
			setActive: function(bool){setActive("localisation", bool)},
			getActive: function(){return localisation.active;},
			setAvailable: function(bool){setAvailable("localisation", bool)},
			getAvailable: function(){return localisation.available;},
			setPosted: function(bool){setPosted("flashlight", bool)},
			getPosted: function(){return flashlight.posted;},
			getPermissions: function(){return localisation.permissions;},
			getAll: function(){
				var tmp = {};
				tmp.name = this.getName();
				tmp.label = this.getLabel();
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				tmp.permissions = this.getPermissions();

				return tmp;
			}
		},
		battery : {
			getValue: getBattery,
			getName: function(){return battery.name;},
			getLabel: function(){return battery.label;},
			setActive: function(bool){setActive("battery", bool)},
			getActive: function(){return battery.active;},
			setAvailable: function(bool){setAvailable("battery", bool)},
			getAvailable: function(){return battery.available;},
			setPosted: function(bool){setPosted("battery", bool)},
			getPosted: function(){return battery.posted;},
			getPermissions: function(){return battery.permissions;},
			getAll: function(){
				var tmp = {};
				tmp.name = this.getName();
				tmp.label = this.getLabel();
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				tmp.permissions = this.getPermissions();
				
				return tmp;
			}
		},
		flashlight : {
			getValue: getFlashlight,
			getName: function(){return flashlight.name;},
			getLabel: function(){return flashlight.label;},
			setActive: function(bool){setActive("flashlight", bool)},
			getActive: function(){return flashlight.active;},
			setAvailable: function(bool){setAvailable("flashlight", bool)},
			getAvailable: function(){return flashlight.available;},
			setPosted: function(bool){setPosted("flashlight", bool)},
			getPosted: function(){return flashlight.posted;},
			getPermissions: function(){return flashlight.permissions;},
			getAll: function(){
				var tmp = {};
				tmp.name = this.getName();
				tmp.label = this.getLabel();
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				tmp.permissions = this.getPermissions();
				
				return tmp;
			}
		},
		device : {
			getValue: getDevice,
			getName: function(){return device.name;},
			getLabel: function(){return device.label;},
			setActive: function(bool){setActive("device", bool)},
			getActive: function(){return device.active;},
			setAvailable: function(bool){setAvailable("device", bool)},
			getAvailable: function(){return device.available;},
			setPosted: function(bool){setPosted("device", bool)},
			getPosted: function(){return device.posted;},
			getPermissions: function(){return device.permissions;},
			getAll: function(){
				var tmp = {};
				tmp.name = this.getName();
				tmp.label = this.getLabel();
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				tmp.permissions = this.getPermissions();
				
				return tmp;
			}
		},
		sim : {
			getValue: getSim,
			getName: function(){return sim.name;},
			getLabel: function(){return sim.label;},
			setActive: function(bool){setActive("sim", bool)},
			getActive: function(){return sim.active;},
			setAvailable: function(bool){setAvailable("sim", bool)},
			getAvailable: function(){return sim.available;},
			setPosted: function(bool){setPosted("sim", bool)},
			getPosted: function(){return sim.posted;},
			getPermissions: function(){return sim.permissions;},
			getAll: function(){
				var tmp = {};
				tmp.name = this.getName();
				tmp.label = this.getLabel();
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				tmp.permissions = this.getPermissions();
				
				return tmp;
			}
		},
		screenOrientation : {
			getValue: getscreenOrientation,
			getName: function(){return screenOrientation.name;},
			getLabel: function(){return screenOrientation.label;},
			setActive: function(bool){setActive("screenOrientation", bool)},
			getActive: function(){return screenOrientation.active;},
			setAvailable: function(bool){setAvailable("screenOrientation", bool)},
			getAvailable: function(){return screenOrientation.available;},
			setPosted: function(bool){setPosted("screenOrientation", bool)},
			getPosted: function(){return screenOrientation.posted;},
			getPermissions: function(){return screenOrientation.permissions;},
			getAll: function(){
				var tmp = {};
				tmp.name = this.getName();
				tmp.label = this.getLabel();
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				tmp.permissions = this.getPermissions();
				
				return tmp;
			}
		},
		wifi : {
			getValue: getWifi,
			getName: function(){return wifi.name;},
			getLabel: function(){return wifi.label;},
			setActive: function(bool){setActive("wifi", bool)},
			getActive: function(){return wifi.active;},
			setAvailable: function(bool){setAvailable("wifi", bool)},
			getAvailable: function(){return wifi.available;},
			setPosted: function(bool){setPosted("wifi", bool)},
			getPosted: function(){return wifi.posted;},
			getPermissions: function(){return wifi.permissions;},
			getAll: function(){
				var tmp = {};
				tmp.name = this.getName();
				tmp.label = this.getLabel();
				tmp.value = this.getValue();
				tmp.active = this.getActive();
				tmp.available = this.getAvailable();
				tmp.posted = this.getPosted();
				tmp.permissions = this.getPermissions();
				
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
		
				
		
		getAll: function(){
			var vectAll = [
				this.network.getAll(),
				this.bluetooth.getAll(),
				this.localisation.getAll(),
				this.battery.getAll(),
				this.flashlight.getAll(),
				this.device.getAll(),
				this.sim.getAll(),
				this.screenOrientation.getAll(),
				this.wifi.getAll(),
				
				// this.orientation.getAll(),
				// this.globalization.getAll(),
			];
			// vectAll.push(this.localisation.getAll());

			return vectAll;
		},
		checkAllAvailable: function(){
			var allProbes = this.getAll();
			
			return $q(function(resolve, reject){
				var i = 0;
				var recur = function(i){
					checkProbeAvailable(allProbes[i]).then(function(){
						recur(++i);
					}).catch(function(){
						resolve();
					});
				};
				recur(i);
			});
		}
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