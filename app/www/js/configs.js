angular.module('ServU')

.config(function ($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptor');
});