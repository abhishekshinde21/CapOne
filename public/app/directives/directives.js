
/** This files defines the directive and its template urls **/
app.directive('listings', function() {
	return {
		restrict: 'E',
		templateUrl: 'app/templates/listings.tpl.html'
	};
});

app.directive('price', function() {
	return {
		restrict: 'E',
		templateUrl: 'app/templates/price.tpl.html'
	};
});
