// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// angular.module('myapp', ['ionic', 'camera.controllers', 'ngCordova'])

angular.module('ServU', ['ionic', 'ngCordova', 'pascalprecht.translate', 'btford.socket-io'])

.config(function($stateProvider, $urlRouterProvider, $translateProvider) {
	$stateProvider
	.state('login', {
		url: '/login',
		templateUrl: 'views/login.html',
		controller: 'LoginCtrl'
	})
	
	.state('register', {
		url: '/register',
		templateUrl: 'views/register.html',
		controller: 'RegisterCtrl'
	})

	.state('main', {
		url: '/main',
		templateUrl: 'views/main.html',
		controller: 'MainCtrl'
	})
  
	$urlRouterProvider.otherwise('/login');

	$translateProvider.useSanitizeValueStrategy('escape'); // gestion des caractères d’échappement
	$translateProvider.useStaticFilesLoader({prefix: 'lang/', suffix: '.json'}); // chargement des fichiers de langues
	$translateProvider.registerAvailableLanguageKeys(['en','fr'], {'en_US': 'en', 'en_UK': 'en', 'fr_FR': 'fr', 'fr_BE': 'fr'}) // définition des langues disponibles
	.determinePreferredLanguage(); // sélection de la langue du système
	$translateProvider.use();
})

.run(function($ionicPlatform, $rootScope, $state, AuthService, AUTH_EVENTS) {
	$ionicPlatform.ready(function() {
		if(window.cordova && window.cordova.plugins.Keyboard) {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

			// Don't remove this line unless you know what you are doing. It stops the viewport
			// from snapping when text inputs are focused. Ionic handles this internally for
			// a much nicer keyboard experience.
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
	$rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
		if (!AuthService.isAuthenticated()) {
			console.log(next.name);
			if (next.name !== 'login' && next.name !== 'register') {
				event.preventDefault();
				$state.go('login');
			}
		}
	});
})
