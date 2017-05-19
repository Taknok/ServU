
rootApp.controller('devicesCtrl', function($rootScope, $scope, $uibModal, $http, $filter, $compile) {

    $scope.devices = [];
    $scope.moreDevice = [];
    $scope.nbPhones = 0;
    $scope.nbTablets = 0;

    $scope.refreshDevices = function(){
        $http.get(url+'/api/users/'+username+'/devices').then(function(res){
            $scope.devices = res.data;
            angular.forEach($scope.devices,function(device){
                device.probes = {};
                device.actionsAvailable = {};
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
            $scope.countDevices();
            console.log('Loaded devices: ',$scope.devices);
            console.log('Refresh complete');
        });
    };

    // Get a device given its uuid
    $scope.getDeviceByUuid = function(uuid){
        return $filter('filter')($scope.devices,{'uuid':uuid});
    };

    // Computes the number of devices
    $scope.countDevices = function () {
        $scope.nbPhones = 0;
        $scope.nbTablets = 0;
        for(var i = $scope.devices.length - 1; i >= 0; i--){
            if($scope.devices[i].platform === 'mobile-phone'){$scope.nbPhones++}
            else if($scope.devices[i].platform === 'tablet'){$scope.nbTablets++}
        }
    };

    // Delete a device
    $scope.deleteByUuid = function(uuid) {
        for(var i = $scope.devices.length-1; i >= 0; i--){
            if($scope.devices[i].uuid == uuid){
                $scope.devices.splice(i,1);
                break;
            }
        };
        alert('deleted'+uuid);
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
        if(state === 'on'){$scope.actionToSend.params.state = 'off'}
        else if(state === 'off'){$scope.actionToSend.params.state = 'toggle'}
        else if(state === 'toggle'){$scope.actionToSend.params.state = 'on'}
    };

    $scope.changeActionToSend = function(deviceName,uuid,action){
        $scope.actionToSend = {};
        $scope.actionToSend.label = action.label;
        $scope.actionToSend.name = action.name;
        $scope.actionToSend.toDevice = {};
        $scope.actionToSend.toDevice.name = deviceName;
        $scope.actionToSend.toDevice.uuid = uuid;
        $scope.actionToSend.params = {};
        $scope.actionToSend.validParams = false;

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
                '<button class="btn btn-default btn-block" ng-click="changeFlashlightState(actionToSend.params.state)">{{actionToSend.params.state}}</button>' +
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
                 message: 'Action '+actionName+" has been sent to your device"
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

    $scope.refreshDevices();

});
