/**
 * Created by Guillaume on 16/05/2017.
 */
rootApp
    .factory('Alerts', function() {
        return {
            alert: function(typeAlert, message) {
                var completeAlert = '<div class="alert alert-' + typeAlert + ' fade in alert-dismissible" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' + '<span aria-hidden="true">&times;</span></button>' +
                    message +
                    '</div>';
                window.setTimeout(function() { $(".alert").alert('close'); }, 2000);
                return completeAlert;
            },
            notify: function(typeNotify, message, delay) {
                var glyph = '';
                if (typeNotify === 'success') {
                    glyph = 'glyphicon-ok';
                } else {
                    glyph = 'glyphicon-fire';
                }

                $.notify({
                    // options
                    icon: 'glyphicon ' + glyph,
                    message: message
                },{
                    // settings
                    type: typeNotify,
                    placement: {
                        from: 'bottom',
                        align: 'left'
                    },
                    delay: delay,
                    mouse_over: 'pause'
                });
            }
        }
    })

    .factory('EventSkeletons', function($http) {

        var reqListEventSkeleton = {
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/users/' + username + '/eventSkeletons',
            json: true
        };


        return {
            listEventSkeletons: function () {
                return $http(reqListEventSkeleton);
            },
            deleteEventSkeleton: function(id) {
                var reqDeleteEventSkeleton = {
                    method: 'DELETE',
                    url: 'http://127.0.0.1:3000/api/users/' + username + '/eventSkeletons/' + id,
                    json: true
                };
                return $http(reqDeleteEventSkeleton);
            }
        };
    })

    .factory('Events', function($http) {

        return {
            getListEvent: function(uuid) {
                var reqListEvent = {
                    method: 'GET',
                    url: url + '/api/users/' + username + '/devices/' + uuid + '/events',
                    json: true
                };
                return $http(reqListEvent);
            },
            postNewEvent: function(uuid, eventSkeleton) {

            }

        };


    });