angular.module('ServU')

.constant('OpenWeatherConfig', {
   searchUrl: 'http://api.openweathermap.org/data/2.5/weather?q=',
   units: '&units=metric',
   appid: '&appid=62f6be4c772a3903ce384e4a8d1035ac',
   imgUrl: 'http://openweathermap.org/img/w/' 
})

.constant('ServUConfig', {
   searchUrl: 'http://www.servu.ml/api',
   units: '&units=metric',
   appid: '&appid=62f6be4c772a3903ce384e4a8d1035ac',
   imgUrl: 'http://openweathermap.org/img/w/' 
})