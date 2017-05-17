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
        }

        $scope.username = 'Toto';
        getListEventSkeleton();
    });