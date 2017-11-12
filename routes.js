'use strict';
var listings;

function handleError(res, reason, message, code) {
	console.log("ERROR: " + reason);
	res.status(code || 500).json({"error": message});
}

function clearData(req) {
	listings = {};
	listings.data = undefined;
	listings.pageNumber = parseInt(req.body.pageNumber);
	listings.pageSize = parseInt(req.body.pageSize);
	listings.totalRecords = 0;
}

/** listings API **/
module.exports = function(app, db) {
	app.post("/listings", function(req, res) {
		clearData(req);
		db.collection("listings").find().count(function(err, docs) {
			if (err) {
				handleError(res, err.message, "Failed to get listings.");
			} else {
				listings.totalRecords = docs;
				db.collection("listings").find().skip((parseInt(req.body.pageNumber) - 1) * parseInt(req.body.pageSize)).limit(parseInt(req.body.pageSize)).toArray(function(err, docs) {
					if (err) {
						handleError(res, err.message, "Failed to get listings.");
					} else {
						listings.data = docs;
						res.status(200).json(listings);
					}
				});
			}
		});
	});

	/** returns listing for particular id: currently not used in GUI **/
	app.get("/listings/:id", function(req, res) {
		db.collection("listings").aggregate([
			{
				$match: {
					_id : parseInt(req.params.id)
				} 
			},
			{
				$lookup: {
					from : 'reviews',
					localField : '_id',
					foreignField : 'listing_id',
					as : 'reviews'
				}
			}
		], function(err, doc) {
				if (err) {
					handleError(res, err.message, "Failed to get listing");
				} else {
					res.status(200).json(doc);
				}
		});
	});
	

	/** returns listings within the price ranges: currently not used in GUI **/
	app.post("/listings/price", function(req, res) {
		clearData(req);
		db.collection("listings").find({price: {$gte: parseFloat(req.body.price1), $lte: parseFloat(req.body.price2)}}).count(function(err, docs) {
			if (err) {
				handleError(res, err.message, "Failed to get listings.");
			} else {
				listings.totalRecords = docs;
				db.collection("listings").find({price: {$gte: parseFloat(req.body.price1), $lte: parseFloat(req.body.price2)}}).skip((parseInt(req.body.pageNumber) - 1) * parseInt(req.body.pageSize)).limit(parseInt(req.body.pageSize)).toArray(function(err, docs) {
					if (err) {
						handleError(res, err.message, "Failed to get listings.");
					} else {
						listings.data = docs;
						res.status(200).json(listings);
					}
				});
			}
		});
	});

	/** Returns listings within geo location **/
	app.post("/listings/geo", function(req, res) {
		clearData(req);
		db.collection("listings").find({ loc :
			{ $near :
			   {
				 $geometry : {
					type : "Point" ,
					coordinates : [parseFloat(req.body.longitude), parseFloat(parseFloat(req.body.latitude))] 
				 },
				 $maxDistance: parseFloat(req.body.dist)
			   }
			}
		 }).count(function(err, docs) {
			if (err) {
				handleError(res, err.message, "Failed to get listings.");
			} else {
				listings.totalRecords = docs;
				db.collection("listings").find({ loc :
					{ $near :
					   {
						 $geometry : {
							type : "Point" ,
							coordinates : [parseFloat(req.body.longitude), parseFloat(parseFloat(req.body.latitude))] 
						 },
						 $maxDistance: parseFloat(req.body.dist)
					   }
					}
				 }).skip((parseInt(req.body.pageNumber) - 1) * parseInt(req.body.pageSize)).limit(parseInt(req.body.pageSize)).toArray(function(err, docs) {
					if (err) {
						handleError(res, err.message, "Failed to get listings.");
					} else {
						listings.data = docs;
						res.status(200).json(listings);
					}
				});
			}
		});
	});

	/** Returns listings within date range: Not used in GUI **/
	app.post("/listings/date", function(req, res) {
		clearData(req);
		db.collection("listings").aggregate([
			{
				$lookup: {
					from : 'calendar',
					localField : '_id',
					foreignField : 'listing_id',
					as : 'availability'
				}
			},
			{
				$unwind: "$availability"
			},
			{
				$match: {
					"availability.date" : {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)},
					"availability.available" : "t"
				}
			},
			{ 
				"$group" : { 
					"_id": null, "total": { $sum : 1 } 
				}
			}
		], function(err, docs) {
			if (err) {
				handleError(res, err.message, "Failed to get listing availibility");
			} else {
				listings.totalRecords = docs[0].total;
				db.collection("listings").aggregate([
					{
						$lookup: {
							from : 'calendar',
							localField : '_id',
							foreignField : 'listing_id',
							as : 'availability'
						}
					},
					{
						$unwind: "$availability"
					},
					{
						$match: {
							"availability.date" : {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)},
							"availability.available" : "t"
						}
					},
					{ 
						$skip : (parseInt(req.body.pageNumber) - 1) * parseInt(req.body.pageSize)
					},
					{
						$limit : parseInt(req.body.pageSize)
					}
				], function(err, docs) {
						if (err) {
							handleError(res, err.message, "Failed to get listing availibility");
						} else {
							listings.data = docs;
							res.status(200).json(listings);
						}
				});
			}
		});
	});
	
	return app;
};