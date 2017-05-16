
rootApp.controller('devicesCtrl', function($scope, $uibModal) {
    $scope.devices = devices;
    $scope.moreDevice = devices[0];

    $scope.refreshDevices = function(){
        alert('refresh');
    };

    // Get a device given its uuid
    $scope.getDeviceByUuid = function(uuid){
        for(var i = $scope.devices.length-1; i >= 0; i--){
            if($scope.devices[i].uuid == uuid){
                return $scope.devices[i];
            }
        };
    };

    // Computes the number of devices
    $scope.nbPhones = 0;
    $scope.nbTablets = 0;
    angular.forEach(devices, function(device){
        if(device.platform == 'mobile-phone'){$scope.nbPhones++;}
        else if(device.platform == 'tablet'){$scope.nbTablets++;}
    });

    // Delete a device
    $scope.deleteByUuid = function(uuid) {
        for(var i = devices.length-1; i >= 0; i--){
            if(devices[i].uuid == uuid){
                devices.splice(i,1);
                break;
            }
        };
        alert('deleted'+uuid);
    };

    // Open the modal to obtain more info
    $scope.openMoreModal = function(uuid) {

        var device = $scope.getDeviceByUuid(uuid);


    };

    // Add the correct class to the battery bar
    $scope.getBarTypeClassBoolean = function(battery,classStr) {
        switch(classStr) {
            case 'primary': if(battery >= 95) {return true;} else {return false;} break;
            case 'success': if(battery < 95 && battery >= 40) {return true;} else {return false;} break;
            case 'warning': if(battery < 40 && battery >= 20) {return true;} else {return false;} break;
            case 'danger' : if(battery < 20) {return true;} else {return false;} break;
        }
    };

});
