
/** Controller for the homepage - completes user requests **/
app.controller('ListingsCtrl', [
	'$scope', 'listingService', 'func'
	, function ($scope, listingService, func) {
		/** The grid option shows what is contained in the table **/
		$scope.gridOptions = {
			paginationPageSizes: [10, 20, 30, 40],
			paginationPageSize: 10,
			rowHeight:200,
			enableColumnResizing: true,
			useExternalPagination : true,
			useExternalSorting : true,
			enableColumnMenus: false,
			enableSorting: false,
			loading : false,
			loaded : false,
			columnDefs: [
				{ field: 'listing_url', visible:false },
				{ field: '_id', displayName: 'ID', cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{ row.entity.listing_url }}" target="_target">{{ COL_FIELD }}</a></div>' },
				{ field: 'name', displayName : 'Name' },
				{ field: 'picture_url', displayName : 'Picture', cellTemplate:"<img width=\"300px\" ng-src=\"{{grid.getCellValue(row, col)}}\" lazy-src>" },
				{ field: 'summary', displayName : 'Summary' },
				{ field: 'price', displayName : 'Price', cellFilter: 'currency' },
				{ field: 'review_scores_rating', displayName : 'Rating' }
			],
			onRegisterApi: function(gridApi) {
				$scope.gridApi = gridApi;
				gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
					$scope.filterData.pageNumber = newPage; // For navigating to new page
					$scope.filterData.pageSize = pageSize; // Sets new page size
					listings();
				});
			}
		};

		/** Function calls web service to get the data **/
		function listings() {
			$scope.gridOptions.data = [];
			$scope.gridOptions.loading = true;
			$scope.gridOptions.loaded = false;

			listingService.getData($scope.filterData)
			.then(function (result) {
				computeBuckets(result.data.data);
				barGraph(result.data.data);
				$scope.gridOptions.totalItems = parseInt(result.data.totalRecords);
				if (typeof result.data.data != 'undefined')
					$scope.gridOptions.data = func.confirmIsArray(result.data.data);
				$scope.gridOptions.loading = false;
				$scope.gridOptions.loaded = true;
				console.log('listingService (promises) returned to controller.');
			},
			function () {
				console.log('listingService retrieval failed.');
			});
		}

		/** Compiles data for the pie chart based on what is shown on the table **/
		function computeBuckets(data) {
			var price;
			$scope.data = [0, 0, 0, 0, 0];

			angular.forEach(data, function(item) {
				price = parseInt(item.price);

				if (price >= 0 && price < 200)
					$scope.data[0]++;
				else if (price >= 200 && price < 400)
					$scope.data[1]++;
				else if (price >= 400 && price < 600)
					$scope.data[2]++;
				else if (price >= 600 && price < 1000)
					$scope.data[3]++;
				else
					$scope.data[4]++;	
			});
		}

		/** Compiles data for the bar graph based on what is shown on the table **/
		function barGraph(data) {
			var i = 0;
			var j = 0;
			angular.forEach(data, function(item) {
				$scope.labels2[i] = item._id;
				$scope.data2[0][i] = parseFloat(item.cleaning_fee.replace(/\$/g, ''));
				$scope.data2[1][j] = parseFloat(item.extra_people.replace(/\$/g, ''));
				i++;
				j++;


			});
		}

		/** initializes the default values for intial loading **/
		function clearFilters() {
			$scope.filterData = {};
			$scope.filterData.pageNumber = 1;
			$scope.filterData.pageSize = 10;
			$scope.labels = ["$0 - $200", "$200 - $400", "$400 - $600", "$600 - $1000", "$1000+"];
			$scope.labels2 = [];
			$scope.series = ["Cleaning Fee", "Additional Person"];
			$scope.data2 = [[],[]];
		}

		/** function will be called when loading page for first time **/
		function getData() {
			clearFilters();
			listings();
		}

		getData();
	}
]);

/** Controller for Price Estimation page **/
app.controller('PriceCtrl', [
	'$scope', 'priceService', 'func'
	, function ($scope, priceService, func) {
		/** The grid option shows what is contained in the table **/
		$scope.gridOptions = {
			paginationPageSizes: [10, 20, 30, 40],
			paginationPageSize: 10,
			rowHeight:200,
			enableColumnResizing: true,
			useExternalPagination : true,
			useExternalSorting : true,
			enableColumnMenus: false,
			enableSorting: false,
			loading : false,
			loaded : false,
			columnDefs: [
				{ field: 'listing_url', visible:false },
				{ field: 'name', displayName : 'Name', cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{ row.entity.listing_url }}" target="_target">{{ COL_FIELD }}</a></div>' },
				{ field: 'picture_url', displayName : 'Picture', cellTemplate:"<img width=\"300px\" ng-src=\"{{grid.getCellValue(row, col)}}\" lazy-src>" },
				{ field: 'summary', displayName : 'Summary' },
				{ field: 'price', displayName : 'Price', cellFilter: 'currency' },
				{ field: 'review_scores_rating', displayName : 'Rating' }
			],
			onRegisterApi: function(gridApi) {
				$scope.gridApi = gridApi;
				gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
					$scope.filterData.pageNumber = newPage; // For navigating to new page
					$scope.filterData.pageSize = pageSize; // Sets new page size
					listings();
				});
			}
		};

		/** Function calls web service to get the data **/
		function listings() {
			$scope.gridOptions.data = [];
			$scope.gridOptions.loading = true;
			$scope.gridOptions.loaded = false;

			priceService.getData($scope.filterData)
			.then(function (result) {
				averageWeeklyPrice(result);
				$scope.gridOptions.totalItems = parseInt(result.data.totalRecords);
				if (typeof result.data.data != 'undefined')
					$scope.gridOptions.data = func.confirmIsArray(result.data.data);
				$scope.gridOptions.loading = false;
				$scope.gridOptions.loaded = true;
				console.log('priceService (promises) returned to controller.');
			},
			function () {
				console.log('priceService retrieval failed.');
			});
		}

		/** function that computes average weekly price based on location (longitude, and latitude) and distance **/
		function averageWeeklyPrice(result) {
			var i = 0;
			var total = 0;
			angular.forEach(result.data.data, function(item) {
				total += parseInt(item.price);
				i++;
			});
			$scope.filterData.price = parseInt((total * 7) /i);
		}

		/** This function will be called when user clicks on Search button **/
		$scope.search = function () {
			listings();
		};

		/** initializes the default values for intial loading **/
		function clearFilters() {
			$scope.filterData = {};
			$scope.filterData.latitude = 37.76005055162609;
			$scope.filterData.longitude = -122.42135244186619;
			$scope.filterData.dist = 0;
			$scope.filterData.pageNumber = 1;
			$scope.filterData.pageSize = 10;
		}
		
		/** function will be called when loading page for first time **/
		function getData() {
			clearFilters();
//			listings();
		}
		
		getData();
	}
]);
	