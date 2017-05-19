
rootApp.controller('devicesCtrl', function($rootScope, $log, $scope, $uibModal, $http, $filter, $compile, Events, Alerts) {

    $scope.devices = [];
    $scope.moreDevice = [];
    $scope.allActionsAvailable = {
        flashlight: {
            name: "flashlight",
            label: "Flashlight",
            description: "Toggle flashlight"
        },
        ring: {
            name: "ring",
            label: "Ring",
            description: "Make the devices ring"
        },
        vibrate: {
            name: "vibrate",
            label: "Vibrate",
            description: "Make the devices vibrate"
        },
        sms: {
            name: "sms",
            label: "Text message",
            description: "Send an sms"
        }

    };

    $scope.refreshDevices = function(){
        $http.get(url+'/api/users/'+username+'/devices').then(function(res){
            $scope.devices = res.data;
            angular.forEach($scope.devices,function(device){
                device.probes = {};
                device.actionsAvailable = {};
                $scope.updateListEvent(device.uuid);
                $http.get(url+'/api/users/'+username+'/devices/'+device.uuid+'/probes').then(function(res){
                    angular.forEach(res.data,function(probe){
                        device.probes[probe.name] = probe;
                    });
                },function(err){
                    alert('Error while trying to get device\'s probes: ',err);
                    console.log('Error : ',err);
                });
                $http.get(url+'/api/users/'+username+'/devices/'+device.uuid+'/actionsAvailable').then(function(res){
                    angular.forEach(res.data,function(action){
                        device.actionsAvailable[action.name] = action;
                    });
                },function(err){
                    alert('Error while trying to get device\'s available actions: ',err);
                    console.log('Error : ',err);
                })
            });
        },function(err){
            alert('Error while trying to get user\'s devices: '+err);
            console.log('Error : ',err);
        }).then(function(){
            console.log('Loaded devices: ',$scope.devices);
            console.log('Refresh complete');
        });
    };

    // Get a device given its uuid
    $scope.getDeviceByUuid = function(uuid){
        return $filter('filter')($scope.devices,{'uuid':uuid});
    };

    // Delete a device
    $scope.changeDeleteDevice = function(uuid) {
        $scope.deleteDevice = $scope.getDeviceByUuid(uuid)[0];
    };

    $scope.deleteByUuid = function(uuid) {
        for(var i = $scope.devices.length-1; i >= 0; i--){
            if($scope.devices[i].uuid === uuid){
                $scope.devices.splice(i,1);
                break;
            }
        };
        $http.delete(url+'/api/users/'+username+'/devices/'+uuid).then(function(res){
            $.notify({
                // options
                icon: 'glyphicon glyphicon-ok',
                message: 'Device '+uuid+' deleted successfully'
            },{
                // settings
                type: 'success',
                placement: {
                    from: 'bottom',
                    align: 'left'
                },
                delay: 5000,
                mouse_over: 'pause'
            });
        },function(err){
            $.notify({
                // options
                icon: 'glyphicon glyphicon-ok',
                message: 'Error while trying to delete device '+uuid+'('+res.data+')'
            },{
                // settings
                type: 'danger',
                placement: {
                    from: 'bottom',
                    align: 'left'
                },
                delay: 10000,
                mouse_over: 'pause'
            });
        });
        console.log('Deleted : ',uuid);
    };

    // More about device
    $scope.changeMoreDevice = function(uuid) {
        $scope.moreDevice = $scope.getDeviceByUuid(uuid)[0];
        console.log('moreDevice changed');
    };

    $scope.getReadableTime = function(lastUpdate) {
        var date = new Date(lastUpdate);
        var options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
        options.timeZone = "UTC";
        options.timeZoneName = "short";
        return  date.toLocaleDateString('en-US',options)+' at '+date.toLocaleTimeString('en-US');
    };

    // Add the correct class to the battery bar
    $scope.getBarTypeClassBoolean = function(percent,classStr) {
        switch(classStr) {
            case 'primary': if(percent >= 95) {return true;} else {return false;} break;
            case 'success': if(percent < 95 && percent >= 40) {return true;} else {return false;} break;
            case 'warning': if(percent < 40 && percent >= 20) {return true;} else {return false;} break;
            case 'danger' : if(percent < 20) {return true;} else {return false;} break;
        }
    };

    // Send an action
    $scope.changeFlashlightState = function(state) {
        if(state === 'on'){return 'off'}
        else if(state === 'off'){return 'toggle'}
        else if(state === 'toggle'){return 'on'}
    };

    $scope.changeActionToSendToAll = function(action) {
        $scope.actionToSendToAll = {};
        $scope.actionToSendToAll.params = {};
        $scope.actionToSendToAll.label = action.label;
        $scope.actionToSendToAll.name = action.name;

        var myEl = angular.element(document.querySelector('#actionSendingToAllParams'));
        if (action.name === 'ring' || action.name === 'vibrate') {
            $scope.actionToSendToAll.params.time = 1;
            myEl.html(
                '<form name="sendActionForm" class="form-inline"><div class="form-group" style="width: 100%;">' +
                '<div class="input-group" style="width: 100%">' +
                '<div class="input-group-addon" style="width: 20%">Duration : </div>' +
                '<input name="time" ng-model="actionToSendToAll.params.time" class="form-control" required min="1" max="10" type="number" style="width: 100%" required>' +
                '<div class="input-group-addon" style="width: 20%">Seconds</div></div></form>'
            );
        } else if(action.name === 'sms') {
            $scope.actionToSendToAll.params.dest = '';
            $scope.actionToSendToAll.params.msg = '';
            myEl.html(
                '<form name="sendActionForm" class="form-inline"><div class="form-group" style="width: 100%">' +
                '<div class="input-group" style="width: 100%">' +
                '<div class="input-group-addon" style="width: 20%">Text message :</div>' +
                '<input class="form-control" placeholder="Phone Number" type="text" ng-model="actionToSendToAll.params.dest" required>' +
                '<textarea class="form-control" placeholder="Text message" ng-model="actionToSendToAll.params.msg" required>' +
                '</div></form>'
            );
        } else if(action.name === 'flashlight') {
            $scope.actionToSendToAll.params.state = 'on';
            myEl.html(
                '<form name="sendActionForm" class="form-inline"><div class="form-group" style="width: 100%">' +
                '<div class="input-group" style="width: 100%">' +
                '<div class="input-group-addon" style="width: 20%">State : </div>' +
                '<button class="btn btn-default btn-block" ng-click="actionToSendToAll.params.state = changeFlashlightState(actionToSendToAll.params.state)">{{actionToSendToAll.params.state}}</button>' +
                '</div></form>'
            );
        }
        $compile(myEl)($scope);

    };

    $scope.changeActionToSend = function(deviceName,uuid,action){
        $scope.actionToSend = {};
        $scope.actionToSend.label = action.label;
        $scope.actionToSend.name = action.name;
        $scope.actionToSend.toDevice = {};
        $scope.actionToSend.toDevice.name = deviceName;
        $scope.actionToSend.toDevice.uuid = uuid;
        $scope.actionToSend.params = {};

        var myEl = angular.element(document.querySelector('#actionSendingParams'));
        if (action.name === 'ring' || action.name === 'vibrate') {
            $scope.actionToSend.params.time = 1;
            myEl.html(
                '<form name="sendActionForm" class="form-inline"><div class="form-group" style="width: 100%;">' +
                '<div class="input-group" style="width: 100%">' +
                '<div class="input-group-addon" style="width: 20%">Duration : </div>' +
                '<input name="time" ng-model="actionToSend.params.time" class="form-control" required min="1" max="10" type="number" style="width: 100%" required>' +
                '<div class="input-group-addon" style="width: 20%">Seconds</div></div></form>'
            );
            $scope.actionToSend.params.time = $scope.actionToSend.params.time*1000;
        } else if(action.name === 'sms') {
            $scope.actionToSend.params.dest = '';
            $scope.actionToSend.params.msg = '';
            myEl.html(
                '<form name="sendActionForm" class="form-inline"><div class="form-group" style="width: 100%">' +
                '<div class="input-group" style="width: 100%">' +
                '<div class="input-group-addon" style="width: 20%">Text message :</div>' +
                '<input class="form-control" placeholder="Phone Number" type="text" ng-model="actionToSend.params.dest" required>' +
                '<textarea class="form-control" placeholder="Text message" ng-model="actionToSend.params.msg" required>' +
                '</div></form>'
            );
        } else if(action.name === 'flashlight') {
            $scope.actionToSend.params.state = 'on';
            myEl.html(
                '<form name="sendActionForm" class="form-inline"><div class="form-group" style="width: 100%">' +
                '<div class="input-group" style="width: 100%">' +
                '<div class="input-group-addon" style="width: 20%">State : </div>' +
                '<button class="btn btn-default btn-block" ng-click="actionToSend.params.state = changeFlashlightState(actionToSend.params.state)">{{actionToSend.params.state}}</button>' +
                '</div></form>'
            );
        }
        $compile(myEl)($scope);

    };

    $scope.sendAction = function(actionToSend){

        var uuid = actionToSend.toDevice.uuid;
        var actionName = actionToSend.name;
        var params = actionToSend.params;

        $http.post(url+'/api/users/'+username+'/devices/'+uuid+'/actionsUser', {
            "type": actionName,
            "label": actionName,
            "description": actionName + ' triggered by user',
            "parameters": params
        }).then(function(res){
            $.notify({
                // options
                 icon: 'glyphicon glyphicon-ok',
                 message: 'Action '+actionName+" has been sent to your device "+actionToSend.toDevice.name
            },{
                // settings
                 type: 'success',
                 placement: {
                     from: 'bottom',
                     align: 'left'
                 },
                 delay: 5000,
                 mouse_over: 'pause'
            });
         },function(err){
             $.notify({
                 // options
                 icon: 'glyphicon glyphicon-remove',
                 message: 'An error ('+err.data+') occurred while trying to send the action to your device. Please try again later.'
             },{
                 // settings
                 type: 'danger',
                 placement: {
                     from: 'bottom',
                     align: 'left'
                 },
                 delay: 10000,
                 mouse_over: 'pause'
             });
         });
    };

    $scope.sendActionToAll = function(action){
        angular.forEach($scope.devices,function(device) {
            $http.post(url + '/api/users/' + username + '/devices/' + device.uuid + '/actionsUser', {
                "type": action.name,
                "label": action.label,
                "description": action.label + ' triggered for all devices',
                "parameters": action.params
            }).then(function (res) {
                $.notify({
                    // options
                    icon: 'glyphicon glyphicon-ok',
                    message: 'Action ' + action.name + " has been sent to your device " + device.name
                }, {
                    // settings
                    type: 'success',
                    placement: {
                        from: 'bottom',
                        align: 'left'
                    },
                    delay: 5000,
                    mouse_over: 'pause'
                });
            }, function (err) {
                $.notify({
                    // options
                    icon: 'glyphicon glyphicon-remove',
                    message: 'An error (' + err.data + ') occurred while trying to send the action to your device ' + device.name + '. Please try again later.'
                }, {
                    // settings
                    type: 'danger',
                    placement: {
                        from: 'bottom',
                        align: 'left'
                    },
                    delay: 10000,
                    mouse_over: 'pause'
                });
            });
        });
    };

    $scope.updateListEvent = function getListEvent(uuid) {
        Events.getListEvent(uuid).then(function listEventSkeletonOK(events) {
            Alerts.notify('success', '<strong>GOOD</strong> Successful Recuperation of Events',2000);
            $scope.events = events.data;
            $log.log(events.data);
        }, function listEventErr(response) {
            var errorValue = response.status;
            if(errorValue === 404) { // Email already used
                Alerts.notify('danger', '<strong>ERROR</strong> Device or User not found',2000);
            }
            else if (errorValue === 401) { // Unauthorized
                Alerts.notify('danger', '<strong>ERROR</strong> Unauthorized',2000);
            }
            else if (errorValue === 403) { // Forbidden
                Alerts.notify('danger', '<strong>ERROR</strong> Forbidden',2000);
            }
            else { // Unknown Issue
                Alerts.notify('danger', '<strong>ERROR</strong> Unknown Issue',2000);
            }
        });
    };


});
