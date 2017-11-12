**************** README FILE ****************

This project has MongoDB database, NodeJS, and AngularJS dependencies

The following was used to store data into MongoDB: 
open command prompt/terminal window (1)
Type in the following commands in order:

mkdir data

mongod --dbpath data

Open new command prompt/terminal window (2) to import csv files:

mongoimport -d airbnb -c listings --type csv --file listings.csv --headerline
mongoimport -d airbnb -c reviews --type csv --file reviews.csv --headerline
mongoimport -d airbnb -c calendar --type csv --file calendar.csv --headerline

mongo
Once running mongo, type in the following commands to verify that the three collections have been imported into mongodb
> use airbnb
> show collections
calendar
listings
reviews


I wrote following functions to make some changes to column types

Change price column from string to float:

> db.listings.find().forEach(function(doc){
	if (doc.price.length > 0) {
		var priceStr = doc.price.replace(/,/g, '').replace(/\$/g, '');
		var newprice = parseFloat(priceStr);
		doc.price = newprice;
		db.listings.save(doc);
	}
})

Change column type from string to desired format:

db.reviews.find().forEach(function(doc){
	if (doc.date.length > 0) {
		var date = new Date(doc.date)
		doc.date = date;
		db.reviews.save(doc);
	}
})

Created index for performance improvement
> db.calendar.createIndex({listing_id:1})
> db.reviews.createIndex({listing_id:1})
> db.calendar.createIndex({ listing_id: 1, date: 1, available:1 })
> db.calendar.createIndex({ date: 1, available:1 })


Add new column for geo location from longitude and latitude column values:

> db.listings.find().forEach(function(doc){
	db.listings.update(doc, {$set : {"loc" : {"type": "Point", "coordinates": [doc.longitude, doc.latitude]}}});
})

Add index for geo location:

> db.listings.createIndex({loc:"2dsphere"})

Query to find listings 50 meters from longitude and latitude:

> db.listings.find(
   { loc :
       { $near :
          {
            $geometry : {
               type : "Point" ,
               coordinates : [-122.42135244186619, 37.76005055162609] 
			},
			$maxDistance: 50
          }
       }
    }
)

************** How to run this code locally **************

First, open a command prompt (1) and run the following command:
mongod --dbpath data

Open new command prompt (2) and run the following command:
npm start

Open a browser and type the following URL:
localhost:3000

______________________________

************** On the web application **************
There is a bootstrap menu bar at the top (Consists of the Airbnb label, Home link, Price Estimation link) - has two submenus: Home and Price Estimation

Home: 
	Home consists of a table of listings, pie chart, and bar graph (Three Methods of Data Visualization)
	Table:	
		Table Columns:
		ID - links to Airbnb site
		Name - name of listing
		Picture: picture of listing
		Summary: summary of the listing
		Price: price per night of the listing
		Rating: rating of listing out of 100

		Table has paging for navigation along with page size (10, 20, 30, 40)

	Pie Chart:
		Five ranges for price per night: 0 - 200, 200 - 400, 400 - 600, 600 - 1000, 1000+
		Animated when user navigates through pages of the listings table
		Data consists of data shown in the table above

	Bar Graph:  
		Shows graph of cleaning and additional people fees for the listings from the table

Price Estimation:
Price Estimation consists of text fields (latitude, longitude, and distance), and table.

Page is initialized with 37.76005055162609 latitude, -122.42135244186619 longitude, and 0 distance; when Search button is clicked, shows data on given property to show how the Price Estimation page works

Table has paging for navigation along with page size (10, 20, 30, 40)

Displays average weekly price of listings within given distance 

(if you want to pinpoint particular property, enter EXACT longitude and latitude and distance of 0)
