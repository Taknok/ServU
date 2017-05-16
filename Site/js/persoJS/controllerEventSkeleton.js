/**
 * Created by Guillaume on 16/05/2017.
 */

rootApp
    .controller("EventSkeletonCtrl", function($scope, $http, $log, $compile, EventSkeletons, Alerts) {
        function getListEventSkeleton() {
            EventSkeletons.listEventSkeletons().then(function listEventSkeletonOK(eventSkeletons) {
                var alertGetSuccess = Alerts.alert('success', '<strong>GOOD</strong> Successful Recuperation of EventSkeletons');
                $(".alertPlaceEventSkeleton").append(alertGetSuccess);
                $scope.eventSkeletons = eventSkeletons.data.list;
            }, function () {
                /*localStorage.clear();
                 document.location.href="#/log/connect";
                 document.location.reload();*/
            });
            window.setTimeout(getListEventSkeleton,15000);
        }

        $scope.username = 'Toto';
        getListEventSkeleton();
    });