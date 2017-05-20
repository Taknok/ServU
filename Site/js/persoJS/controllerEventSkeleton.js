/**
 * Created by Guillaume on 16/05/2017.
 */

rootApp
    .filter('localisation', function () {
        return function (items) {
            var filtered = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (/localisation/i.test(item.probe.substring(0, 12))) {
                    filtered.push(item);
                    return filtered
                }
            }
            return filtered;
        };
    })
    .filter('notlocalisation', function () {
        return function (items) {
            var filtered = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (!/localisation/i.test(item.probe.substring(0, 12))) {
                    filtered.push(item);
                }
            }
            return filtered;
        };
    })
    .controller("EventSkeletonCtrl", function($scope, $http, $log, $compile, EventSkeletons, Alerts) {

        $scope.updateListEventSkeleton = function getListEventSkeleton() {
            EventSkeletons.listEventSkeletons().then(function listEventSkeletonOK(eventSkeletons) {
                //Alerts.notify('success', '<strong>GOOD</strong> Successful Recuperation of EventSkeletons',2000);
                $scope.eventSkeletons = eventSkeletons.data;
                $log.log(eventSkeletons.data);
            }, function () {
            });
        };

        $scope.deleteEventSkeleton = function(eventSkeleton) {
            var eventSkeletonID = eventSkeleton.id;
            EventSkeletons.deleteEventSkeleton(eventSkeletonID).then(function successCallback() {
                var alertDeleteSuccess = Alerts.alert('success', '<strong>GOOD</strong> ' + eventSkeleton.label + ' deleted');
                $(".alertPlaceEventSkeleton").append(alertDeleteSuccess);
                $scope.updateListEventSkeleton();
            }, function errorCallback(response) {
                var errorValue = response.status;
                if(errorValue === 404) { // Email already used
                    var alertNotFounded = Alerts.alert('danger', '<strong>ERROR</strong> EventSkeleton or User not found');
                    $(".alertPlaceEventSkeleton").append(alertNotFounded);
                }
                else if(errorValue === 400) { // Wrong Format
                    var alertWrongFormat = Alerts.alert('danger', '<strong>ERROR</strong> Wrong Format');
                    $(".alertPlaceEventSkeleton").append(alertWrongFormat);
                }
                else if (errorValue === 401) { // Unauthorized
                    var alertUnauthorized = Alerts.alert('danger', '<strong>ERROR</strong> Unauthorized');
                    $(".alertPlaceEventSkeleton").append(alertUnauthorized);
                }
                else if (errorValue === 403) { // Forbidden
                    var alertForbidden = Alerts.alert('danger', '<strong>ERROR</strong> Forbidden');
                    $(".alertPlaceEventSkeleton").append(alertForbidden);
                }
                else { // Unknown Issue
                    var alertUnknown = Alerts.alert('danger', '<strong>ERROR</strong> Unknown Issue');
                    $(".alertPlaceEventSkeleton").append(alertUnknown);
                }
            });
        };

        $scope.getTypeProbe = function(typeProbe) {
            switch(typeProbe) {
                case 'wifi.isEnable':
                    return 'fa-wifi';
                    break;
                case 'flashlight.isActivated':
                    return 'fa-bolt';
                    break;
                case 'battery.level':
                    return 'fa-battery-full';
                    break;
                case 'battery.isPlugged':
                    return 'fa-battery-full';
                    break;
                case 'network.state':
                    return 'fa-cloud';
                    break;
                case 'bluetooth.isEnable':
                    return 'fa-bluetooth';
                    break;
                case 'bluetooth.isConnected':
                    return 'fa-bluetooth';
                    break;
                case 'localisation.lat':
                    return 'fa-globe';
                    break;
                case 'localisation.lng':
                    return 'fa-globe';
                    break;
                case 'localisation.timestamp':
                    return 'fa-globe';
                    break;
                default:
                    return;
                    break;

            }
        };

        $scope.getTypeAction = function(typeAction) {
            switch(typeAction) {
                case 'ring':
                    return 'fa-volume-up';
                    break;
                case 'vibrate':
                    return 'fa-volume-off';
                    break;
                case 'sms':
                    return 'fa-commenting';
                    break;
                case 'flashlight':
                    return 'fa-bolt';
                    break;
                default:
                    return;
                    break;

            }
        };

        $scope.getLabelProbe = function(typeProbe) {
            switch(typeProbe) {
                case 'wifi.isEnable':
                    return 'Wifi';
                    break;
                case 'flashlight.isActivated':
                    return 'Flashlight';
                    break;
                case 'battery.level':
                    return 'Battery Level';
                    break;
                case 'battery.isPlugged':
                    return 'Battery Plugged';
                    break;
                case 'network.state':
                    return 'Network State';
                    break;
                case 'bluetooth.isEnable':
                    return 'Bluetooth';
                    break;
                case 'bluetooth.isConnected':
                    return 'Bluetooth Connected';
                    break;
                case 'localisation.lat':
                    return 'GPS';
                    break;
                case 'localisation.lng':
                    return 'GPS';
                    break;
                case 'localisation.timestamp':
                    return 'GPS';
                    break;
                default:
                    return;
                    break;

            }
        };

        $scope.filtreLocalisation = function(ifCondition){
            var filtre = (ifCondition.probe !== 'localisation.lat' && ifCondition.probe !== 'localisation.lng');
            $log.log(ifCondition.probe, filtre);
            return filtre;
        };


        $scope.giveMap = function(EventSkeleton) {
            if (true || (EventSkeleton.probe === 'localisation.lgn') || (EventSkeleton.probe === 'localisation.lat')) {
                var index = 0;
                angular.forEach(EventSkeleton.if, function(value,key){
                    if(value.probe === 'localisation.lat'){
                        index = key -1;
                    }
                });
                $log.log(EventSkeleton,index);
                var latMin = EventSkeleton.if[index].value;
                var latMax = EventSkeleton.if[index + 1].value;
                var lngMin = EventSkeleton.if[index + 2].value;
                var lngMax = EventSkeleton.if[index +3].value;

                var lat = (latMin + latMax)/2;
                $log.log(lat);
                var lng = (lngMin + lngMax)/2;
                $log.log(lng);
                var rayon = (latMax-latMin) * 110574 / 2;
                var mapOptionsPiti = {
                    center: {lat : lat, lng : lng},
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: false,
                    zoom: 14,
                    zoomControl: true,
                    mapTypeControl: false,
                    scaleControl: true,
                    streetViewControl: false,
                    rotateControl: true
                };
                var mapIDPiti = "map"+EventSkeleton.id+"";
                var mapPiti = new google.maps.Map(document.getElementById(mapIDPiti), mapOptionsPiti);
                var radiusRangePiti = new google.maps.Circle({
                    strokeColor: '#a3afff',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#86f3ff',
                    fillOpacity: 0.10,
                    clickable : false,
                    draggable : false,
                    map: mapPiti,
                    center: mapPiti.center,
                    radius: rayon
                });
                var markerPiti = new google.maps.Marker({
                    position: {lat : lat, lng : lng},
                    map: mapPiti
                });
                mapPiti.setCenter(markerPiti.getPosition());
                radiusRangePiti.setCenter(markerPiti.getPosition());

            }

        };

        $scope.getLabelAction = function(typeAction) {
            switch(typeAction) {
                case 'ring':
                    return 'Ring';
                    break;
                case 'vibrate':
                    return 'Vibrate';
                    break;
                case 'sms':
                    return 'SMS';
                    break;
                case 'flashlight':
                    return 'Flashlight';
                    break;
                default:
                    return;
                    break;

            }
        };

        $scope.findParameter = function(parameter, typeAction) {
            switch(typeAction) {
                case 'ring':
                    return 'for ' + parameter.time + ' sec';
                    break;
                case 'vibrate':
                    return 'for ' + parameter.time + ' sec';
                    break;
                case 'sms':
                    return 'to ' + parameter.dest + ' :';
                    break;
                case 'flashlight':
                    return 'turn ' + parameter.state;
                    break;
                default:
                    return;
                    break;

            }
        };

        $scope.giveMessage = function(parameter, typeAction) {
            switch (typeAction) {
                case 'sms':
                    return parameter.msg;
                    break;
                default:
                    return;
                    break;
            }
        }


    });