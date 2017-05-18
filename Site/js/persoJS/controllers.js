
rootApp.controller('devicesCtrl', function($rootScope, $scope, $uibModal, $http, $filter) {

    $scope.devices = [];
    $scope.moreDevice = [];
    $scope.nbPhones = 0;
    $scope.nbTablets = 0;

    $scope.refreshDevices = function(){
        $http.get(url+'/api/users/'+username+'/devices').then(function(res){
            $scope.devices = res.data;
            angular.forEach($scope.devices,function(device){
                device.probes = {};
                $http.get(url+'/api/users/'+username+'/devices/'+device.uuid+'/probes').then(function(res){
                    angular.forEach(res.data,function(probe){
                        device.probes[probe.name] = probe;
                    });
                },function(err){
                    alert('Error while trying to get device\'s probes: ',err);
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
        return new Date(lastUpdate);
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

    $scope.refreshDevices();

});
