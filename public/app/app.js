
/** AngularJS app module, url template, and controller configurations **/
var app = angular.module('app', ['ui.router', 'ngCookies', 'ngTouch', 'ngSanitize', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'chart.js']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	$urlRouterProvider.otherwise("/");
	$stateProvider
		.state('listings', {
			url: "/",
			template: "<listings></listings>",
			controller : "ListingsCtrl"
		})
		.state('price', {
			url: "/price",
			template: "<price></price>",
			controller : "PriceCtrl"
		});

	$locationProvider.hashPrefix('');
});

app.config(function($httpProvider) {

	if (!$httpProvider.defaults.headers.get) {
		$httpProvider.defaults.headers.get = {};
    }
	$httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
	$httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
	$httpProvider.defaults.headers.get.Pragma = 'no-cache';
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
	$httpProvider.defaults.headers.common.Accept = 'application/json,application/octet-stream,text/plain; charset=us-ascii';
	$httpProvider.defaults.headers.common.Authorization = 'Basic airbnb:airbnb123';
	$httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
});
