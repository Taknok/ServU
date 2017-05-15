/**
 * Created by alexa on 15/05/2017.
 */
angular.module('root', [])
    .controller("index", ['$scope', '$log','$http', function($scope, $log, $http) {

        $scope.addUser = function() {
            var data = {
                "username": $scope.username,
                "firstname": $scope.firstname,
                "lastname": $scope.lastname,
                "email": $scope.email,
                "password": $scope.password
            };
            $http.post("http://127.0.0.1:3000/api/users", data).then(function () {
                console.log("Phone posted");
                $http.get("http:/127.0.0.1:3001/api/users/" + $scope.username);
            }).catch(function (e) {
                if (e.status == 400) {
                    console.error("Wrong format or Owner not found :", e);
                } else if (e.status == 401) {
                    console.error("Unauthorized :", e);
                } else if (e.status == 403) {
                    console.error("Forbidden :", e);
                } else if (e.status == 403) {
                    console.error("Another device has the same uuid :", e);
                }
            })
        };
    }]);