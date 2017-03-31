angular.module('ServU')

.factory("hideHeader",[ "$rootScope",  function($rootScope){ //currently no used just exemple
	return {
		init: function(){
			$rootScope.slideHeader = false;
			$rootScope.slideHeaderPrevious = 0;
		}
	};
}])

.factory("actionFacto", [ "$cordovaVibration", function($cordovaVibration){
	return {
		ring: function(time){
			RingtonePicker.timerPlaySound("content://settings/system/ringtone", time);
		},
		vibrate: function(time){
			$cordovaVibration.vibrate(time);
		}
	};
}])

.factory("phoneInfo", [ function(){
	var _uuid = 0;
	return {
		setUuid: function(uuid){
			_uuid = uuid;
		},
		getUuid: function(){
			return _uuid;
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