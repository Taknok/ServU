/**
 * Created by alexa on 10/05/2017.
 */

var cookies = document.cookie.split(';');
var token;
var username;
for(var i = 0; i <cookies.length; i++) {
    if(cookies[i].substr(0,5) === 'token'){
        token = cookies[i].substr(6);
    }
    if(cookies[i].substr(0,7) === 'username'){
        username = cookies[i].substr(9);
    }
}

const url = 'https://servu.ml';
//const url = 'http://127.0.0.1:3000';

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
                '<div class="modal-body form-group" id="modal-body">' +
                '<div class="row"><h5 class="col-xs-3 col-sm-3 col-md-3 col-lg-3 control-label">LABEL</h5>' +
                '<div class="col-xs-9 col-sm-9 col-md-9 col-lg-9 selectContainer">'+
                '<form class="form-inline">' +
                '<div class="input"><input class="form-control" placeholder="Enter a name" type="text" ng-model="label" required>' +
                '</div></form>' +
                '</div></div>' +
                '<div class="row"><h5 class="col-xs-3 col-sm-3 col-md-3 col-lg-3 control-label">DESCRIPTION</h5>' +
                '<div class="col-xs-9 col-sm-9 col-md-9 col-lg-9  selectContainer">'+
                '<form class="form-inline">' +
                '<div class="input"><input class="form-control" placeholder="Enter a description" type="text" ng-model="description" required>' +
                '</div></form>' +
                '</div></div>' +
                '<div class="row">' +
                '<h5 class="col-xs-2 col-sm-2 col-md-2 col-lg-2 control-label">IF</h5>' +
                '<div id="condition1">' +
                '<div class="dropdown col-xs-4 col-sm-3 col-md-3 col-lg-2 selectContainer">' +
                '<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"><i class="{{conditionArray[0].selectedItem.icon}}"></i> {{conditionArray[0].selectedItem.name ? conditionArray[0].selectedItem.name : "Condition"}}' +
                ' <span class="caret"></span></button>' +
                '<ul class="dropdown-menu">' +
                '<li><a href="#"  ng-repeat="item in $ctrl.items" ng-click="$ctrl.condition_update(item,0)"><i class="{{item.icon}}"></i> {{item.name}}</a></li>' +
                '</ul>' +
                '</div>' +
                '<div class="col-xs-10 col-sm-7 col-md-7 col-lg-8 selectContainer">' +
                '<div id="conditionStatus1"></div>'+
                '<div class="pull-right"><button type="button" class="btn btn-positive button-outline" ng-click="$ctrl.ajoutCondition(1)" ng-show="conditionArray[0].selectedItem.name"><i class="fa fa-plus"></i> Add</button></div>' +
                '</div></div>' +
                '</div><br>' +
                '<div id="condition2"></div>' +
                '<br><div class="row"><h5 class="col-xs-2 col-sm-2 col-md-2 col-lg-2 control-label">THEN</h5>' +
                '<div class="dropdown col-xs-4 col-sm-3 col-md-3 col-lg-2 selectContainer">' +
                '<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"><i class="{{$ctrl.selectedAction.icon}}"></i> {{$ctrl.selectedAction.name ? $ctrl.selectedAction.name : "Action"}}' +
                '<span class="caret"></span></button>' +
                '<ul class="dropdown-menu">' +
                '<li><a href="#"  ng-repeat="action in $ctrl.actions" ng-click="$ctrl.action_update(action)"><i class="{{action.icon}}"></i> {{action.name}}</a></li>' +
                '</ul>' +
                '</div>' +
                '<div class="col-xs-10 col-sm-7 col-md-7 col-lg-8 selectContainer">' +
                '<div id="action_statut"></div>'+
                '</div></div></div>' +
                '<div class="modal-footer">' +
                '<button class="btn btn-primary" type="button" ng-disabled="!label || !description || !$ctrl.selectedAction || $ctrl.conditionArray[0].selectedItem " ng-click="$ctrl.ok()">Create</button>' +
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
            modalInstance.result.then(function(){});
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
        $scope.conditionArray = [{selectedItem : "", dataCondition : {}}];
        $scope.username = username;
        //Liste des conditions
        $ctrl.items = [
            {name : 'Wifi', icon : "icon ion-wifi"},
            {name : 'Battery', icon : "icon ion-battery-full"},
            {name : 'Bluetooth', icon : "icon ion-bluetooth"},
            {name: 'Flashlight', icon: 'glyphicon glyphicon-flash'},
            {name: 'Localisation', icon: "icon glyphicon glyphicon-map-marker"}];
        //Liste des actions
        $ctrl.actions = [
            {name : 'Ring', icon : 'icon ion-ios-bell'},
            {name : 'Vibrate', icon : 'icon ion-radio-waves'},
            {name: 'Flashlight', icon: 'glyphicon glyphicon-flash'},
            {name : 'SMS', icon : "glyphicon glyphicon-envelope"}];
        /*
         {name : 'Brigthness', icon : 'icon ion-ios-sunny'},
         {name : 'Wifi', icon : "icon ion-wifi"},
         {name : 'Bluetooth', icon : "icon ion-bluetooth"}];
         */


        $ctrl.ajoutCondition = function(){
            var index = $scope.conditionArray.length;
            var numero = index + 1;
            var myEl = angular.element(document.querySelector('#condition' +numero));
            myEl.html('<div class="row"><div class="col-xs-2 col-sm-2 col-md-2 col-lg-2"></div><div class="dropdown col-xs-4 col-sm-3 col-md-3 col-lg-2 selectContainer">' +
                '<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"><i class="{{conditionArray[' + index + '].selectedItem.icon}}"></i> {{conditionArray[' + index + '].selectedItem.name ? conditionArray[' + index + '].selectedItem.name : "Condition"}}' +
                ' <span class="caret"></span></button>' +
                '<ul class="dropdown-menu">' +
                '<li><a href="#"  ng-repeat="item in $ctrl.items" ng-click="$ctrl.condition_update(item,' + index +')"><i class="{{item.icon}}"></i> {{item.name}}</a></li>' +
                '</ul>' +
                '</div>' +
                '<div class="col-xs-10 col-sm-7 col-md-7 col-lg-8 selectContainer">' +
                '<div id="conditionStatus' + numero +'"></div>'+
                '<div class="pull-right"><button type="button" class="btn btn-positive button-outline" ng-click="$ctrl.ajoutCondition('+ numero +')" ng-show="conditionArray[' + index + '].selectedItem.name"><i class="fa fa-plus"></i> Add</button></div>' +
                '</div>' +
                '</div><br>');
            $scope.conditionArray.push({selectedItem : '', dataCondition : {} });
            myEl.after(
                '<div id="condition' + (numero+1) +'"></div>');
            $compile(myEl)($scope);
        };
        //Lors du clic create du modal
        $ctrl.ok = function () {
            var dataIf = [];
            angular.forEach($scope.conditionArray, function(value, key) {
                if(value.ConditionName === "localisation"){
                    dataIf = dataIf.concat(createTableLocalisation(value.dataCondition, 'localisation',value.dataCondition.comparator));
                }
                else{
                    dataIf.push({
                        probe: value.ConditionName,
                        comparator: value.dataCondition.comparator,
                        value: value.dataCondition.value,
                        logicOperator: ""
                    });
                }
            });
            data = {
                label: $scope.label,
                description: $scope.description,
                if: dataIf,
                action: [{
                    type: $scope.ActionName,
                    parameter: $scope.dataAction
                }]
            };

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
        $scope.affichage = function(index){
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
            marker = new google.maps.Marker({
                position: Enseirb_position,
                map: map
            });
            $scope.conditionArray[index].dataCondition.position = Enseirb_position;

            //Permet d'avoir sa position
            var survId = navigator.geolocation.getCurrentPosition(function (pos) {
                map.setCenter({lat : pos.coords.latitude, lng : pos.coords.longitude});
            }, function(){},{maximumAge: 10000, timeout:0});

            //Permet de creer des marker sur la map
            map.addListener('click', function(e) {
                $scope.conditionArray[index].dataCondition.position = {lat : e.latLng.lat(), lng : e.latLng.lng()};
                if(marker !== undefined){
                    marker.setMap(null);
                }
                marker = new google.maps.Marker({
                    position: $scope.conditionArray[index].dataCondition.position,
                    map: map
                });
                map.setCenter(marker.getPosition());
                radiusRange.setCenter(marker.getPosition());
                $scope.conditionArray[index].dataCondition = {lat : marker.getPosition().lat(), lng : marker.getPosition().lng(), radius : $scope.radius }
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
        $ctrl.condition_update = function (item, index) {
            $scope.conditionArray[index].selectedItem = item;
            var myEl = angular.element(document.querySelector('#conditionStatus' +(index+1)));
            $scope.conditionArray[index].dataCondition = {};

            //MISE A JOUR DE L AFFICHAGE
            if (item.name === "Wifi") {
                $scope.conditionArray[index].ConditionName = "wifi.isEnable";
                $scope.conditionArray[index].dataCondition.comparator = "=";
                $scope.conditionArray[index].dataCondition.value = true;
                $scope.changeFunction = function (name) {
                    if (name === "wifi.isEnable")
                        $scope.conditionArray[index].ConditionName = 'wifi.isConnected';
                    else
                        $scope.conditionArray[index].ConditionName = 'wifi.isEnable';
                };
                $scope.changeCondition = function () {
                    $scope.conditionArray[index].dataCondition.value = !$scope.conditionArray[index].dataCondition.value;
                };
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<button class="btn group-addon" ng-click="changeFunction(conditionArray[' + index + '].ConditionName)">{{conditionArray[' + index + '].ConditionName=="wifi.isEnable" ? "Enable" : "Connected"}}</button>' +
                    '<button class="btn btn-default" ng-click="changeCondition()">{{conditionArray[' + index + '].dataCondition.value}}</button>' +
                    '</div></form>'
                );
            }
            else if(item.name  === "Battery"){
                $scope.conditionArray[index].ConditionName = "battery.level";
                $scope.conditionArray[index].dataCondition.value = 20;
                $scope.conditionArray[index].dataCondition.comparator = '<';
                $scope.batteryStatus = true;
                $scope.batteryPluged = false;
                $scope.changeOperator = function(comparator){
                    if(comparator === '>')
                        $scope.conditionArray[index].dataCondition.comparator = '<';
                    else
                        $scope.conditionArray[index].dataCondition.comparator = '>';
                };
                $scope.changeFunctionBat = function (name) {
                    if (name === "battery.level") {
                        $scope.batteryStatus = false;
                        $scope.conditionArray[index].ConditionName = 'battery.isPlugged';
                        $scope.conditionArray[index].dataCondition.comparator = '=';
                        $scope.conditionArray[index].dataCondition.value = true;
                        $scope.batteryPluged = true;
                    }
                    else {
                        $scope.batteryPluged = false;
                        $scope.conditionArray[index].ConditionName = 'battery.level';
                        $scope.conditionArray[index].dataCondition.comparator = '>';
                        $scope.conditionArray[index].dataCondition.value = 20;
                        $scope.batteryStatus = true;
                    }
                };
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<button class="btn group-addon" ng-click="changeFunctionBat(conditionArray[' + index + '].ConditionName)">{{conditionArray[' + index + '].ConditionName=="battery.level" ? "Level" : "Plugged"}}</button>' +
                    '<div ng-if="batteryStatus" class="input-group"><button class="btn btn-default" ng-click="changeOperator(conditionArray[' + index + '].dataCondition.comparator)">{{conditionArray[' + index + '].dataCondition.comparator}}</button>' +
                    '<div class="form-group"><input class="form-control" id="battery_low" placeholder="%" min="1" max="100" type="number" required ng-model="conditionArray['+index+'].dataCondition.value">' +
                    '</div></div>' +
                    '<div ng-if="batteryPluged" class="input-group">' +
                    '<button class="btn btn-default" ng-click="conditionArray[' + index + '].dataCondition.value = !conditionArray[' + index + '].dataCondition.value">{{conditionArray[' + index + '].dataCondition.value}}</button>' +
                    '</div>' +
                    '</div></div></form>'
                );
            }
            else if (item.name === "Bluetooth"){
                $scope.conditionArray[index].ConditionName = "bluetooth.isEnable";
                $scope.conditionArray[index].dataCondition.comparator = "=";
                $scope.conditionArray[index].dataCondition.value = false;
                $scope.changeFunctionBlue = function (name) {
                    if (name === "bluetooth.isEnable")
                        $scope.conditionArray[index].ConditionName = 'bluetooth.isConnected';
                    else
                        $scope.conditionArray[index].ConditionName = 'bluetooth.isEnable';
                };
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<button class="btn group-addon" ng-click="changeFunctionBlue(conditionArray[' + index + '].ConditionName)">{{conditionArray[' + index + '].ConditionName=="bluetooth.isEnable" ? "Enable" : "Connected"}}</button>' +
                    '<button class="btn btn-default" ng-click="conditionArray[' + index + '].dataCondition.value = !conditionArray[' + index + '].dataCondition.value">{{conditionArray[' + index + '].dataCondition.value}}</button>' +
                    '</div></form>'
                );
            }
            else if (item.name === "Flashlight") {
                $scope.conditionArray[index].ConditionName = "flashlight.isActivated";
                $scope.conditionArray[index].dataCondition.comparator = "=";
                $scope.conditionArray[index].dataCondition.value = false;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Activated : </div>' +
                    '<button class="btn btn-default" ng-click="conditionArray[' + index + '].dataCondition.value = !conditionArray[' + index + '].dataCondition.value">{{conditionArray[' + index + '].dataCondition.value}}</button>' +
                    '</div></form>'
                );
            }
            else if (item.name === "Localisation"){
                $scope.conditionArray[index].ConditionName = "localisation";
                $scope.conditionArray[index].dataCondition.comparator = "<";
                $scope.radius = 1000;
                $scope.changeOperator = function(comparator){
                    if(comparator === '>')
                        $scope.conditionArray[index].dataCondition.comparator = '<';
                    else
                        $scope.conditionArray[index].dataCondition.comparator = '>';
                };
                myEl.html(
                    '<form class="form-inline">' +
                    '<div id="map"></div>' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Select the range : {{radius}}</div>' +
                    '<button class="btn btn-default" ng-click="changeOperator(conditionArray['+index+'].dataCondition.comparator)">{{conditionArray['+index+'].dataCondition.comparator == "<" ? "Inside" : "Outside"}}</button></div>' +
                    '<input class="form-control" type="range" min="1" max="3000" ng-model="radius" ng-change="changeRadius(radius)" required>' +
                    '</form>'
                );
                $scope.affichage(index);
            }
            $compile(myEl)($scope);

            var isLocalisationActive = false;
            angular.forEach($scope.conditionArray, function(value,key){
                $log.log($scope.conditionArray[key].selectedItem.name);
                if($scope.conditionArray[key].selectedItem.name == "Localisation" && !isLocalisationActive){
                    $ctrl.items.splice(4, 1);
                    $log.log($ctrl.items);
                    isLocalisationActive = true;
                }
            });
            $log.log("a la fin ca vaut ", isLocalisationActive);
            if (!isLocalisationActive && typeof $ctrl.items[4] == 'undefined') {
                $ctrl.items.push({name : 'Localisation', icon : "icon glyphicon glyphicon-map-marker"});
                $log.log("a laa fin :", $ctrl.items);
            }
        };

        //Reagi lors du changement d'action
        $ctrl.action_update = function (action) {
            $ctrl.selectedAction = action;
            var myEl = angular.element(document.querySelector('#action_statut'));
            $scope.dataAction = {};

            //MiSE A JOUR DE L AFFICHAGE
            if (action.name === "Ring"){
                $scope.ActionName = "ring";
                $scope.dataAction.time = 1000;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Time : </div>' +
                    '<input class="form-control" id="battery_low" placeholder="Time to ring" min="1" max="10000" type="number" required ng-model="dataAction.time">' +
                    ' <div class="input-group-addon">Milliseconds</div></div></form>'
                );
            }
            else if (action.name === "Vibrate"){
                $scope.ActionName = "vibrate";
                $scope.dataAction.time = 1000;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Time : </div>' +
                    '<input class="form-control" id="Vibrate" placeholder="Time to ring" min="1" max="10000" type="number" required ng-model="dataAction.time">' +
                    ' <div class="input-group-addon">Milliseconds</div></div></form>'
                );
            }
            else if (action.name === "Flashlight") {
                $scope.ActionName = "flashlight";
                $scope.dataAction.state = false;
                myEl.html(
                    '<form class="form-inline"><div class="form-group">' +
                    '<div class="input-group">' +
                    '<div class="input-group-addon">Status : </div>' +
                    '<button class="btn btn-default" ng-click="dataAction.state = !dataAction.state">{{dataAction.state}}</button>' +
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

            else if (action.name === "SMS"){
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

var createTableLocalisation = function(data,probeName,probeComparator) {
    var dataIf = [];
    var locationPoints = limitsArea(data.lat, data.lng, data.radius);
    var comparator1, comparator2;
    if (probeComparator === '>') {
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
        probe: probeName + '.long',
        comparator: comparator2,
        value: locationPoints.lngMin,
        logicOperator: "AND"
    });
    dataIf.push({
        probe: probeName + '.long',
        comparator: comparator1,
        value: locationPoints.lngMax,
        logicOperator: "AND"
    });
    return dataIf;
};