angular.module('ServU')

.constant('ServUApi', {
   url: 'https://www.servu.ml/api',
   socket : 'https://servu.ml/'
   // url: 'http://192.168.1.12:3000/api'
})

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})