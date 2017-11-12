
/** Calls listings web service, which returns data for the homepage **/
app.factory('listingService', [
	'$http', '$q',
	function listingService($http, $q) {
		console.log('listingService fired');

		return {
				getData : function(filterData) {
				var def = $q.defer();
				$http.post("listings", filterData)
				.then(function (result) {
					def.resolve(result);
					console.log('AirBnb data returned to controller.');
				},
				function (error) {
					def.reject("Failed to get AirBnb data");
				});
				return def.promise;
			}
		}
	}
]);


/** Calls the geo listins web service, which returns data for price estimation **/
app.factory('priceService', [
	'$http', '$q',
	function priceService($http, $q) {
		console.log('priceService fired');

		return {
				getData : function(filterData) {
				var def = $q.defer();
				$http.post("listings/geo", filterData)
				.then(function (result) {
					def.resolve(result);
					console.log('AirBnb data returned to controller.');
				},
				function (error) {
					def.reject("Failed to get AirBnb data");
				});
				return def.promise;
			}
		}
	}
]);

/** Utility function to check data whether it is an array or not **/
app.factory('func', function ($location) {
	var func = {};

	func.confirmIsArray = function(x){
		if(Array.isArray(x)){
			return x;
		} else {
			return [x];
		}
	};
	return func;
});