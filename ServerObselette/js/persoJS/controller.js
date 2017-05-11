/**
 * Created by alexa on 10/05/2017.
 */

angular.module('root', ['ui.bootstrap'])
    .controller("gestion", ['$scope', '$log','$uibModal', '$compile', function($scope, $log, $uibModal, $compile) {
        $scope.message = 'Hello World!';
        $scope.addNewButton = function(element){
            $compile(element)($scope);
        };
        var $ctrl = this;
        $ctrl.animationsEnabled = true;
        $scope.open = function (size, parentSelector) {
            $log.log('diozadoiza');
            var modalInstance = $uibModal.open({
                animation: $ctrl.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                template: '<div class="modal-header">' +
                '<h2 class="modal-title" id="modal-title">Creation Event Page</h2>' +
                '</div>' +
                '<div class="modal-body container form-group" id="modal-body">' +
                '<div class="row">' +
                '<h5 class="col-xs-2 control-label">IF</h5>' +
                '<div class="dropdown col-xs-2 selectContainer">' +
                '<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"><i class="{{$ctrl.selectedItem.icon}}"></i> {{$ctrl.selectedItem.name ? $ctrl.selectedItem.name : "Condition"}}' +
                ' <span class="caret"></span></button>' +
                '<ul class="dropdown-menu">' +
                '<li><a href="#"  ng-repeat="item in $ctrl.items" ng-click="$ctrl.condition_update(item)"><i class="{{item.icon}}"></i> {{item.name}}</a></li>' +
                '</ul>' +
                '</div>' +
                '<div class="col-xs-6 selectContainer">' +
                '<div id="condition_statut"></div>'+
                '</div></div><br>' +
                '<div class="row"><h5 class="col-xs-2 control-label">THEN</h5>' +
                '<div class="dropdown col-xs-2 selectContainer">' +
                '<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"><i class="{{$ctrl.selectedAction.icon}}"></i> {{$ctrl.selectedAction.name ? $ctrl.selectedAction.name : "Action"}}' +
                '<span class="caret"></span></button>' +
                '<ul class="dropdown-menu">' +
                '<li><a href="#"  ng-repeat="action in $ctrl.actions" ng-click="$ctrl.action_update(action)"><i class="{{action.icon}}"></i> {{action.name}}</a></li>' +
                '</ul>' +
                '</div>' +
                '<div class="col-xs-6 selectContainer">' +
                '<div id="action_statut"></div>'+
                '</div></div></div>' +
                '<div class="modal-footer">' +
                '<button class="btn btn-primary" type="button" ng-click="$ctrl.ok()">Create</button>' +
                '<button class="btn btn-warning" type="button" ng-click="$ctrl.cancel()">Cancel</button>' +
                '</div>',
                controller: 'ModalInstanceCtrl',
                controllerAs: '$ctrl',
                keybord : true,
                size: size,
                resolve: {
                    items: function () {
                        return $ctrl.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {});
        };

        $ctrl.toggleAnimation = function () {
            $ctrl.animationsEnabled = !$ctrl.animationsEnabled;
        };
    }])
    // Please note that $uibModalInstance represents a modal window (instance) dependency.
    // It is not the same as the $uibModal service used above.

    .controller('ModalInstanceCtrl', function ($scope, $compile,$uibModalInstance, $log) {
        window.onload=function(){
            $('.selectpicker').selectpicker();
        };
        var $ctrl = this;
        $ctrl.items = [
            {name : 'Wifi', icon : "ion-wifi"},
            {name : 'Battery', icon : "ion-battery-full"},
            {name : 'Bluetooth', icon : "ion-bluetooth"},
            {name : 'Localisation', icon : ""}];
        $ctrl.actions = [
            {name : 'Ring', icon : 'icon ion-ios-bell'},
            {name : 'Vibrate', icon : 'icon ion-radio-waves'},
            {name : 'Flash' , icon : 'glyphicon glyphicon-flash'},
            {name : 'Ligthness', icon : ''},
            {name : 'Wifi', icon : "ion-wifi"},
            {name : 'Bluetooth', icon : "ion-bluetooth"}];

        $ctrl.ok = function () {
            $log.log(JSON.stringify($scope.dataCondition));
            $log.log(JSON.stringify($scope.dataAction));
            $uibModalInstance.close();
        };

        $ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.affichage = function(){
            var marker;
            // Option pour la carte
            var Enseirb_position = new google.maps.LatLng(44.8066376, -0.6073554);
            var mapOptions = {
                center: Enseirb_position,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: false,
                zoom: 15,
                zoomControl: true,
                mapTypeControl: false,
                scaleControl: true,
                streetViewControl: false,
                rotateControl: true
            };

            //Creation de la carte
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);

            var survId = navigator.geolocation.watchPosition(function (pos) {
                map.setCenter({lat : pos.coords.latitude, lng : pos.coords.longitude});
            }, function(){},{maximumAge: 10000, timeout:0});
            map.addListener('click', function(e) {
                $scope.dataCondition.position = {lat : e.latLng.lat(), lng : e.latLng.lng()};
                if(marker != undefined){
                    marker.setMap(null);
                }
                marker = new google.maps.Marker({
                    position: $scope.dataCondition.position,
                    map: map
                });
            });
        };

        $ctrl.condition_update = function (item) {
            $ctrl.selectedItem = item;
            var myEl = angular.element(document.querySelector('#condition_statut'));
            $scope.dataCondition = {};
            if (item.name == "Wifi") {
                $scope.dataCondition.enable = false;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default" ng-click="dataCondition.enable = !dataCondition.enable">{{dataCondition.enable}}</button>' +
                    '</div></form>'
                );
            }
            else if(item.name  == "Battery"){
                $scope.dataCondition.level = 20;
                $scope.dataCondition.operator = '<';
                $scope.changeOperator = function(operator){
                    if(operator == '>')
                        $scope.dataCondition.operator = '<';
                    else
                        $scope.dataCondition.operator = '>';
                };
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Battery level : </div>' +
                    '<button class="btn btn-default" ng-click="changeOperator(dataCondition.operator)">{{dataCondition.operator}}</button>' +
                    '<div class="form-group"><input class="form-control" id="battery_low" placeholder="%" min="1" max="100" type="number" required ng-model="dataCondition.level">' +
                    '</div></form>'
                );
            }
            else if (item.name == "Bluetooth"){
                $scope.dataCondition.enable = false;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default" ng-click="dataCondition.enable = !dataCondition.enable">{{dataCondition.enable}}</button>' +
                    '</div></form>'
                );
            }
            else if (item.name == "Localisation"){
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Localisation : </div></div></div><div id="map"></div>' +
                    '</form>'
                );

                $scope.affichage();
            }
            $compile(myEl)($scope);
        };


        $ctrl.action_update = function (action) {
            $ctrl.selectedAction = action;
            var myEl = angular.element(document.querySelector('#action_statut'));
            $scope.dataAction = {};
            if (action.name == "Ring"){
                $scope.dataAction.time = 1;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Time : </div>' +
                    '<input class="form-control" id="battery_low" placeholder="Time to ring" min="1" max="10" type="number" required ng-model="dataAction.time">' +
                    ' <div class="input-group-addon">Seconds</div></div></form>'
                );
            }
            else if (action.name = "Vibrate"){
                $scope.dataAction.time = 1;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Time : </div>' +
                    '<input class="form-control" id="Vibrate" placeholder="Time to ring" min="1" max="10" type="number" required ng-model="dataAction.time">' +
                    ' <div class="input-group-addon">Seconds</div></div></form>'
                );
            }
            else if (action.name = "Flash"){
                $scope.dataAction.enable = true;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default">{{dataCondition.enable}}</button>' +
                    '</div></form>'
                );
            }
            else if (action.name = "Wifi"){
                $scope.dataAction.enable = true;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default" ng-click="dataCondition.enable != dataCondition.enable">{{dataCondition.enable}}</button>' +
                    '</div></form>'
                );
            }
            else if (action.name = "Bluetooth"){
                $scope.dataAction.enable = true;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default" ng-click="dataCondition.enable != dataCondition.enable">{{dataCondition.enable}}</button>' +
                    '</div></form>'
                );
            }
            else if (action.name = "Ligthness"){
                $scope.dataAction.level = 50;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Level of ligthness : </div>' +
                    '<input class="form-control" id="lightnessLevel" placeholder="%" min="1" max="100" type="number" required ng-model="dataAction.level">' +
                    '</div></form>'+
                    '<div class = "item range range-positive">' +
                    '30<input id="selector_range" type= "range" min="30" max="2001">' +
                    '<i class="icon ion-ios-infinite"></i>' +
                    '</div>'
                );
            }
            $compile(myEl)($scope);
        };
    })


    .directive("setOnClick", function($compile){
        return {
            restrict: "A",
            link: function(scope, elm)
            {
                elm.attr("ng-click", "open('lg')");
                elm.removeAttr("set-on-click");
                $compile(elm)(scope);
            }
        };
    });


