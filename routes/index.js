var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var clientID = process.env.FS_CLIENT;
var clientSecret = process.env.FS_SECRET;

var foursquare = (require('foursquarevenues'))(clientID, clientSecret);


// our db models
var User = require("../models/user.js");
var Pin = require("../models/pin.js");


router.get('/', function(req, res) {

  res.render('map.html')

})

router.get('/api/get/foursquare/search/:lat/:long/:query', function(req,res){

    var browserLat = req.params.lat;
    var browserLong = req.params.long;

    var params = {
        "ll": ""+browserLat+","+browserLong+"",
        "query": ""+req.params.query+"",
        "limit":"15"
    };

    foursquare.getVenues(params, function(error, venues) {
        if (!error) {
          res.json(venues);
        }
    });

})

router.get('/api/get/foursquare/venue/:venue_id', function(req,res){

    var venueId = req.params.venue_id;

    var params = {
        "venue_id": ""+venueId+""
    };

    foursquare.getVenue(params, function(error, venues) {
        if (!error) {
          res.json(venues);
        }
    });

})

router.post('/api/post/savepin', function(req,res){

    console.log('the data we received is --> ')
    console.log(req.body);

    // pull out the information from the req.body
    locationName = req.body.locationName;
    foursquareId = req.body.foursquareId;
    locationAddress = req.body.locationAddress;
    latitude = req.body.latitude;
    longitude = req.body.longitude;
    locationType = req.body.locationType;
    locationImage = req.body.locationImage;

    // hold all this data in an object
    // this object should be structured the same way as your db model
    var pinObj = {
        locationName: locationName,
        foursquareId: foursquareId,
        locationAddress: locationAddress,
        longitude: longitude,
        latitude: latitude,
        locationType: locationType,
        locationImage: locationImage
    };

    console.log(pinObj);


    // now, let's save it to the database
    // create a new animal model instance, passing in the object we've created
    var pin = new Pin(pinObj);

    pin.save(function(err,data){
        // if err saving, respond back with error
        if (err){
          var error = {status:'ERROR', message: 'Error saving pin'};
          return res.json(error);
        }

        console.log('saved a new pin!');
        console.log(data);

        // now return the json data of the new animal
        var jsonData = {
          status: 'OK',
          pin: data
        }

        return res.json(jsonData);

    }) 
})

router.get('/api/get/allpins', function(req,res){

  Pin.find(function(err,data){

      if(err){
        var error = {
          status: "ERROR",
          message: err
        }
        return res.json(err)
      }

      var jsonData = {
        status: "OK",
        pins: data
      }

      return res.json(jsonData);

  })

})

router.get('/api/get/pinlocation/:id', function(req,res){

  var venueId = req.params.id;

  Pin.findById(venueId,function(err,data){

      if(err){
        var error = {
          status: "ERROR",
          message: err
        }
        return res.json(err)
      }

      var jsonData = {
        status: "OK",
        pins: data
      }

      return res.json(jsonData);

  })

})


module.exports = router;







