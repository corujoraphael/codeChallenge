'use strict';

var app = angular
	.module('app',['ngRoute', 'dndLists', 'app.home'])
	.config(function($routeProvider, $locationProvider){
		$locationProvider.html5Mode(true);
		$routeProvider
			.when('/', {
				templateUrl : 'app/components/home/home.html',
				controller     : 'HomeController',
			})
			.otherwise({
				redirectTo: '/'
			});
	});
	
app.constant("CryptoJS", CryptoJS);