angular.module('ServU')

.constant('ServUApi', {
   // url: 'http://www.servu.ml/api'
   url: 'http://192.168.1.12:3000/api'
})

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})