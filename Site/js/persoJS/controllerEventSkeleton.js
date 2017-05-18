/**
 * Created by Guillaume on 16/05/2017.
 */

rootApp
    .controller("EventSkeletonCtrl", function($scope, $http, $log, $compile, EventSkeletons, Alerts) {

        $scope.updateListEvent = function getListEventSkeleton() {
            EventSkeletons.listEventSkeletons().then(function listEventSkeletonOK(eventSkeletons) {
                var alertGetSuccess = Alerts.alert('success', '<strong>GOOD</strong> Successful Recuperation of EventSkeletons');
                $(".alertPlaceEventSkeleton").append(alertGetSuccess);
                $scope.eventSkeletons = eventSkeletons.data;
                $log.log(eventSkeletons.data);
            }, function () {
            });
        };



        $scope.deleteEventSkeleton = function(eventSkeleton) {
            var eventSkeletonID = eventSkeleton.id;
            EventSkeletons.deleteEvenetSkeleton(eventSkeletonID).then(function successCallback() {
                var alertDeleteSuccess = Alerts.alert('success', '<strong>GOOD</strong> ' + eventSkeleton.label + ' deleted');
                $(".alertPlaceEventSkeleton").append(alertDeleteSuccess);
                $scope.updateListEvent();
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
                    return 'fa-location';
                    break;
                case 'localisation.long':
                    return 'fa-location';
                    break;
                case 'localisation.timestamp':
                    return 'fa-location';
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
                    return 'Lat';
                    break;
                case 'localisation.long':
                    return 'Long';
                    break;
                case 'localisation.timestamp':
                    return 'Timestamp';
                    break;
                default:
                    return;
                    break;

            }
        };


    });