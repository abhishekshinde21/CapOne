/** This file is used for defining node server and its required dependencies which creates MongoDB connection pull for rest web servies **/
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var routes = require('./routes');
var ObjectID = mongodb.ObjectID;

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

var url = "mongodb://localhost:27017/airbnb";

mongodb.MongoClient.connect(url, (err, db) => {
	if (err) {
		console.log(err);
		process.exit(1);
	}

	console.log("Database connection ready");

	routes(app, db);

	var server = app.listen(process.env.PORT || 3000, function () {
		var port = server.address().port;
		console.log("App now running on port", port);
	});
});
