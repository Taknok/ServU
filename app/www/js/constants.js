angular.module('ServU')

.constant('ServUApi', {
   url: 'http://www.servu.ml/api'
   // url: 'http://192.168.43.37:3000/api'
})

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})