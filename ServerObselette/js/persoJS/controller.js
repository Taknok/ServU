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
        $ctrl.items = [{name : 'Wifi', icon : "ion-wifi"},{name : 'Battery', icon : "ion-battery-full"},
            {name : 'Bluethooth', icon : "ion-bluetooth"}];
        $ctrl.animationsEnabled = true;
        $scope.open = function (size, parentSelector) {
            $log.log('diozadoiza');
            var modalInstance = $uibModal.open({
                animation: $ctrl.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                template: '<div class="modal-header ">' +
                '<h3 class="modal-title" id="modal-title">Creation Event Page</h3>' +
                '</div>' +
                '<div class="modal-body container form-group" id="modal-body">' +
                '<label class="col-xs-3 control-label">Choose A Condition</label>' +
                '<select class="selectpicker col-xs-3 control-label" data-style="btn-primary" data-width="auto" style="display: none;">' +
                '<option data-icon="glyphicon glyphicon-music">Mustard>' +
                '<option data-icon="glyphicon glyphicon-star">Ketchup>' +
                '<option data-icon="glyphicon glyphicon-heart">Relish>' +
                '</select>' +
                '<div class="col-xs-5 selectContainer">' +
                '<select name="repeatSelect" class="form-control" ng-model="selectedCondition" ng-change="$ctrl.condition_update(selectedCondition)">'+
                '<option ng-repeat="item in $ctrl.items" data-icon="glyphicon glyphicon-eye-open" >' +
                '{{ item.name }}' +
                '</option></select></div>'+
                '<div id="condition_statut"></div></div>' +
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

            modalInstance.result.then(function (selectedItem) {
                $ctrl.selected = selectedItem;
            });
        };

        $ctrl.toggleAnimation = function () {
            $ctrl.animationsEnabled = !$ctrl.animationsEnabled;
        };
    }])
    // Please note that $uibModalInstance represents a modal window (instance) dependency.
    // It is not the same as the $uibModal service used above.

    .controller('ModalInstanceCtrl', function ($scope, $compile,$uibModalInstance, items) {
        window.onload=function(){
            $('.selectpicker').selectpicker();
        };
        var $ctrl = this;
        $ctrl.items = items;
        $ctrl.selected = {
            item: $ctrl.items[0]
        };

        $ctrl.ok = function () {
            $uibModalInstance.close($ctrl.selected.item);
        };

        $ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.message = "Salut";
        $scope.data = [];
        $scope.data.enable = false;


        $ctrl.condition_update = function (condition) {
            var myEl = angular.element(document.querySelector('#condition_statut'));
            myEl.html('Condition : Wifi - {{message}}');
            if (condition == "Wifi") {
                myEl.html('Condition : Wifi - {{data.enable}}<div class="checkbox">' +
                    '<label>' +
                    '<input type="checkbox" ng-model="data.enable">Wifi</label>' +
                    '</div>');
            }
            else if(condition == "Battery"){

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


