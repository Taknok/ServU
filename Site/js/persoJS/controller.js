/**
 * Created by alexa on 10/05/2017.
 */

var cookies = document.cookie.split(';');
var token = cookies[0].substr(6);
var username = cookies[1].substr(9);
const url = 'http://127.0.0.1:3000';

var rootApp = angular.module('root', ['ui.bootstrap'])

    .run(function($http) {
        $http.defaults.headers.common['x-access-token'] = token;
    })
    .controller("gestion", ['$scope', '$log','$uibModal', '$compile','$http', function($scope, $log, $uibModal, $compile) {

        //Permet de compiler le bouton pour qu'il ait angular
        $scope.addNewButton = function(element){
            $compile(element)($scope);
        };
        var $ctrl = this;
        $ctrl.animationsEnabled = true;

        //Ouverture du modal
        $scope.open = function (size, parentSelector) {
            var modalInstance = $uibModal.open({
                animation: $ctrl.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                template: '<div class="modal-header">' +
                '<h2 class="modal-title" id="modal-title">Event creation</h2>' +
                '</div>' +
                '<div class="modal-body container form-group" id="modal-body">' +
                '<div class="row"><h5 class="col-xs-2 col-md-2 control-label">LABEL : </h5>' +
                '<div class="col-xs-8 selectContainer">'+
                '<form class="form-inline">' +
                '<div class="input"><input style="width:80%;" class="form-control" placeholder="Enter a name" type="text" ng-model="label" required>' +
                '</div></form>' +
                '</div></div>' +
                '<div class="row"><h5 class="col-xs-2 col-md-2 control-label">DESCRIPTION : </h5>' +
                '<div class="col-xs-8 selectContainer">'+
                '<form class="form-inline">' +
                '<div class="input"><input style="width:80%;" class="form-control" placeholder="Enter a description" type="text" ng-model="description" required>' +
                '</div></form>' +
                '</div></div>' +
                '<div class="row">' +
                '<h5 class="col-xs-2 col-md-2 control-label">IF</h5>' +
                '<div class="dropdown col-xs-2 col-md-2 selectContainer">' +
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
                '<button class="btn btn-primary" type="button" ng-disabled="!label || !description || !$ctrl.selectedAction || !$ctrl.selectedItem " ng-click="$ctrl.ok()">Create</button>' +
                '<button class="btn btn-warning" type="button" ng-click="$ctrl.cancel()">Cancel</button>' +
                '</div>',
                controller: 'ModalInstanceCtrl',
                controllerAs: '$ctrl',
                keyboard : true,
                size: size,
                resolve: {
                    items: function () {
                        return $ctrl.items;
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {});
        };

        //Fait une petite anim
        $ctrl.toggleAnimation = function () {
            $ctrl.animationsEnabled = !$ctrl.animationsEnabled;
        };
    }])

    //Controller du modal
    .controller('ModalInstanceCtrl', function ($scope, $compile,$uibModalInstance, $log, $http) {
        window.onload=function(){
            $('.selectpicker').selectpicker();
        };
        var $ctrl = this;
        $scope.username = username;
        //Liste des conditions
        $ctrl.items = [
            {name : 'Wifi', icon : "icon ion-wifi"},
            {name : 'Battery', icon : "icon ion-battery-full"},
            {name : 'Bluetooth', icon : "icon ion-bluetooth"},
            {name : 'Localisation', icon : "icon glyphicon glyphicon-map-marker"}];
        //Liste des actions
        $ctrl.actions = [
            {name : 'Ring', icon : 'icon ion-ios-bell'},
            {name : 'Vibrate', icon : 'icon ion-radio-waves'},
            {name : 'Flash' , icon : 'glyphicon glyphicon-flash'},
            {name : 'Brigthness', icon : 'icon ion-ios-sunny'},
            {name : 'Wifi', icon : "icon ion-wifi"},
            {name : 'Bluetooth', icon : "icon ion-bluetooth"},
            {name : 'SMS', icon : "glyphicon glyphicon-envelope"}];

        //Lors du clic create du modal
        $ctrl.ok = function () {
            var dataIf;
            if($scope.ConditionName === "localisation"){
                dataIf = createTableLocalisation($scope.dataCondition, 'localisation',$scope.dataCondition.comparator);
            }
            else{
                dataIf = [{
                    probe: $scope.ConditionName,
                    comparator: $scope.dataCondition.comparator,
                    value: $scope.dataCondition.value,
                    logicOperator: ""
                }];
            }
            var data = {
                label: $scope.label,
                description: $scope.description,
                if: dataIf,
                action: [{
                    type: $scope.ActionName,
                    parameter: $scope.dataAction
                }]
            };

            //Envoie de la requete pour creer un evenement
            $http.post(url + "/api/users/" + $scope.username + '/eventSkeletons', data).then(function () {
                $log.log("Evenement bien envoyé au serveur");
            }).catch(function (e) {
                if (e.status === 400) {
                    console.error("Wrong format or Owner not found :", e);
                } else if (e.status === 401) {
                    console.error("Unauthorized :", e);
                } else if (e.status === 403) {
                    console.error("Forbidden :", e);
                } else if (e.status === 404) {
                    console.error("User or device not found :", e);
                }
            });
            //Ferme le modal
            $uibModalInstance.close();
        };

        //Lors du clic sur cancel ou a cote du modal
        $ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        //Gere l'affichage de la carte pour localisation
        $scope.affichage = function(){
            var marker;

            // Option pour la carte
            var Enseirb_position = new google.maps.LatLng(44.8066376, -0.6073554);
            var mapOptions = {
                center: Enseirb_position,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: false,
                zoom: 14,
                zoomControl: true,
                mapTypeControl: false,
                scaleControl: true,
                streetViewControl: false,
                rotateControl: true
            };

            //Creation de la carte
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);
            var radiusRange = new google.maps.Circle({
                strokeColor: '#a3afff',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#86f3ff',
                fillOpacity: 0.10,
                clickable : false,
                draggable : false,
                map: map,
                center: map.center,
                radius: $scope.radius
            });

            //Permet d'avoir sa position
            var survId = navigator.geolocation.getCurrentPosition(function (pos) {
                map.setCenter({lat : pos.coords.latitude, lng : pos.coords.longitude});
            }, function(){},{maximumAge: 10000, timeout:0});

            //Permet de creer des marker sur la map
            map.addListener('click', function(e) {
                $scope.dataCondition.position = {lat : e.latLng.lat(), lng : e.latLng.lng()};
                if(marker !== undefined){
                    marker.setMap(null);
                }
                marker = new google.maps.Marker({
                    position: $scope.dataCondition.position,
                    map: map
                });
                map.setCenter(marker.getPosition());
                radiusRange.setCenter(marker.getPosition());
                $scope.dataCondition = {lat : marker.getPosition().lat(), lng : marker.getPosition().lng(), radius : $scope.radius }
            });

            //Permet de changer le zoom de la carte en fonction du rayon
            $scope.changeRadius = function(filtre_rayon){
                var valeur_rayon = parseFloat(filtre_rayon);
                radiusRange.setRadius(valeur_rayon);
                if (valeur_rayon < 75)
                    map.setZoom(18);
                else if (valeur_rayon >= 75 && valeur_rayon < 150)
                    map.setZoom(17);
                else if (valeur_rayon >= 150 && valeur_rayon < 300)
                    map.setZoom(16);
                else if (valeur_rayon >= 300 && valeur_rayon < 500)
                    map.setZoom(15);
                else if(valeur_rayon >= 500 && valeur_rayon < 1000)
                    map.setZoom(14);
                else if(valeur_rayon >= 1000 && valeur_rayon <= 1500)
                    map.setZoom(13);
                else if(valeur_rayon >= 1500)
                    map.setZoom(12);
            };
        };

        //Reagi lors du changement de condition
        $ctrl.condition_update = function (item) {
            $ctrl.selectedItem = item;
            var myEl = angular.element(document.querySelector('#condition_statut'));
            $scope.dataCondition = {};

            //MISE A JOUR DE L AFFICHAGE
            if (item.name === "Wifi") {
                $scope.ConditionName = "wifi.isEnable";
                $scope.dataCondition.comparator = "=";
                $scope.dataCondition.value = false;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default" ng-click="dataCondition.value = !dataCondition.value">{{dataCondition.value}}</button>' +
                    '</div></form>'
                );
            }
            else if(item.name  === "Battery"){
                $scope.ConditionName = "battery.level";
                $scope.dataCondition.value = 20;
                $scope.dataCondition.comparator = '<';
                $scope.changeOperator = function(comparator){
                    if(comparator === '>')
                        $scope.dataCondition.comparator = '<';
                    else
                        $scope.dataCondition.comparator = '>';
                };
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Battery level : </div>' +
                    '<button class="btn btn-default" ng-click="changeOperator(dataCondition.comparator)">{{dataCondition.comparator}}</button>' +
                    '<div class="form-group"><input class="form-control" id="battery_low" placeholder="%" min="1" max="100" type="number" required ng-model="dataCondition.value">' +
                    '</div></form>'
                );
            }
            else if (item.name === "Bluetooth"){
                $scope.ConditionName = "bluetooth.isConnected";
                $scope.dataCondition.comparator = "=";
                $scope.dataCondition.value = false;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default" ng-click="dataCondition.value = !dataCondition.value">{{dataCondition.value}}</button>' +
                    '</div></form>'
                );
            }
            else if (item.name === "Localisation"){
                $scope.ConditionName = "localisation";
                $scope.dataCondition.comparator = "<";
                $scope.radius = 1000;
                $scope.changeOperator = function(comparator){
                    if(comparator === '>')
                        $scope.dataCondition.comparator = '<';
                    else
                        $scope.dataCondition.comparator = '>';
                };
                myEl.html(
                    '<form class="form-inline">' +
                    '<div id="map"></div>' +
                    '<button type="submit" class="btn btn-default">Select the range :</button>' +
                    '<input class="form-control" type="range" min="1" max="3000" ng-model="radius" ng-change="changeRadius(radius)" required>' +
                    '<button type="submit" class="btn btn-default">{{radius}}</button>' +
                    '<button class="btn btn-default" ng-click="changeOperator(dataCondition.comparator)">{{dataCondition.comparator == "<" ? "Inside" : "Outside"}}</button>' +
                    '</form>'
                );
                $scope.affichage();
            }
            $compile(myEl)($scope);
        };

        //Reagi lors du changement d'action
        $ctrl.action_update = function (action) {
            $ctrl.selectedAction = action;
            var myEl = angular.element(document.querySelector('#action_statut'));
            $scope.dataAction = {};

            //MiSE A JOUR DE L AFFICHAGE
            if (action.name === "Ring"){
                $scope.ActionName = "ring";
                $scope.dataAction.time = 1;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Time : </div>' +
                    '<input class="form-control" id="battery_low" placeholder="Time to ring" min="1" max="10" type="number" required ng-model="dataAction.time">' +
                    ' <div class="input-group-addon">Seconds</div></div></form>'
                );
            }
            else if (action.name === "Vibrate"){
                $scope.ActionName = "vibrate";
                $scope.dataAction.time = 1;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Time : </div>' +
                    '<input class="form-control" id="Vibrate" placeholder="Time to ring" min="1" max="10" type="number" required ng-model="dataAction.time">' +
                    ' <div class="input-group-addon">Seconds</div></div></form>'
                );
            }
            else if (action.name === "Flash"){
                $scope.ActionName = "flash";
                $scope.dataAction.comparator = "=";
                $scope.dataAction.value = false;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default" ng-click="dataAction.value = !dataAction.value">{{dataAction.value}}</button>' +
                    '</div></form>'
                );
            }
            else if (action.name === "Wifi"){
                $scope.ActionName = "wifi";
                $scope.dataAction.comparator = "=";
                $scope.dataAction.value = false;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default" ng-click="dataAction.value = !dataAction.value">{{dataAction.value}}</button>' +
                    '</div></form>'
                );
            }
            else if (action.name === "Bluetooth"){
                $scope.ActionName = "bluetooth";
                $scope.dataAction.comparator = "=";
                $scope.dataAction.value = false;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default" ng-click="dataAction.value = !dataAction.value">{{dataAction.value}}</button>' +
                    '</div></form>'
                );
            }
            else if (action.name === "Brigthness"){
                $scope.ActionName = "brigthness";
                $scope.dataAction.level = 50;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Level of ligthness : </div>' +
                    '<input class="form-control" id="lightnessLevel" placeholder="%" min="1" max="100" type="number" required ng-model="dataAction.level">' +
                    '</div></form>'
                );
            }

            else if (action.name = "SMS"){
                $scope.ActionName = "sms";
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Message :</div>' +
                    '<input class="form-control" id="destSMS" placeholder="Phone Number" type="text" required ng-model="dataAction.dest">' +
                    '<textarea class="form-control" id="SMS" placeholder="Message Text" required ng-model="dataAction.msg">' +
                    '</div></form>'
                );
            }
            $compile(myEl)($scope);
        };
    })

    //Permet de recompiler un bouton javascript avec set-on-click avec angular
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


//FOnction pour retourner le carré de localisation avec le rayon

var limitsArea = function(lat, lng, radius){
    function DistanceToLat(distance){
        var lat = distance/110574;
        return lat;
    }
    function DistanceToLng(distance, lat){
        var Lng = distance/(111320 * Math.cos((lat/180) * Math.PI));
        return Lng;
    }
    return{
        latMin : lat - DistanceToLat(radius),
        latMax : lat + DistanceToLat(radius),
        lngMin : lng - DistanceToLng(radius,lat),
        lngMax : lng + DistanceToLng(radius,lat)
    }
};

var createTableLocalisation = function(data,probeName,probeComparator){
    var dataIf =[];
    var locationPoints = limitsArea(data.lat,data.lng,data.radius);
    var comparator1, comparator2;
    if(probeComparator === '>' ){
        comparator1 = '>';
        comparator2 = '<';
    }
    else{
        comparator1 = '<';
        comparator2 = '>';
    }
    dataIf.push({
        probe: probeName + '.lat',
        comparator: comparator2 ,
        value: locationPoints.latMin,
        logicOperator: ""
    });
    dataIf.push({
        probe: probeName + '.lat',
        comparator: comparator1,
        value: locationPoints.latMax,
        logicOperator: "AND"
    });
    dataIf.push({
        probe: probeName + '.lng',
        comparator: comparator2,
        value: locationPoints.lngMin,
        logicOperator: "AND"
    });
    dataIf.push({
        probe: probeName + '.lng',
        comparator: comparator1,
        value: locationPoints.lngMax,
        logicOperator: "AND"
    });
    return dataIf;
};
