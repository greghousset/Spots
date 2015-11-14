var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// our db models
var Person = require("../models/person.js");
var Place = require("../models/place.js");

/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {

  var jsonData = {
  	'name': 'Spot',
  	'api-status':'OK'
  }

  // respond with json data
  res.json(jsonData)
});

router.get('/add-person', function(req,res){

  res.render('add-person.html')

})

router.get('/add-place', function(req,res){

  res.render('add-place.html')

})

router.get('/people', function(req,res){

  res.render('people.html')

})


router.post('/api/create/place', function(req,res){

  //console.log('!!!!!GOT HERE!!!!!!')
  console.log(req.body);

  var placeObj = {

    //for arrays
    //interests: req.body.interests.split(','),
    userId: req.body.userId,
    name: req.body.name,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    locationType: req.body.locationType,
    price: req.body.price,
    neighborhood: req.body.neighborhood,
    cuisine: req.body.cuisine,
    vibe: req.body.vibe,
    image: req.body.image,
    food: req.body.food,
    url: req.body.url
    //dateAdded : { type: Date, default: Date.now }
  }

  var place = new Place(placeObj);

  place.save(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      return res.json(err)
    }

    var jsonData = {
      status: "OK",
      person: data
    }

    return res.json(jsonData);

  })

})

router.post('/api/create/person', function(req,res){

  //console.log('!!!!!GOT HERE!!!!!!')
  console.log(req.body);

  var personObj = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    slug : req.body.name.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-'),
    imageUrl: req.body.imageUrl
    //dateAdded : { type: Date, default: Date.now }
  }

  var person = new Person(personObj);

  person.save(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      return res.json(err)
    }

    var jsonData = {
      status: "User Saved",
      person: data
    }

    console.log(jsonData);
    res.redirect('/people');

  })

})


router.get('/api/get/places', function(req,res){

  Place.find(function(err,data){

      if(err){
        var error = {
          status: "ERROR",
          message: err
        }
        return res.json(err)
      }

      var jsonData = {
        status: "OK",
        places: data
      }

      return res.json(jsonData);

  })

})

router.get('/api/get/places/:slug', function(req,res){

  var requestedName = req.params.slug;
  //console.log(requestedName);


  Place.find({userId:requestedName},function(err,data){

      if(err){
        var error = {
          status: "ERROR",
          message: err
        }
        return res.json(err)
      }

      var jsonData = {
        status: "OK",
        places: data
      }

      return res.json(jsonData);

  })

})

router.get('/api/get/people', function(req,res){

  Person.find(function(err,data){

      if(err){
        var error = {
          status: "ERROR",
          message: err
        }
        return res.json(err)
      }

      var jsonData = {
        status: "OK",
        people: data
      }

      return res.json(jsonData);

  })

})


router.get('/api/delete/person/:slug', function(req,res){
  var requestedName = req.params.slug;

  // let's remove the document where name is "Sam Slover"
  Person.findOneAndRemove({slug:requestedName},function(err, data){
    // err
    if(err) console.log('we have error -> ' + err);

    // let's log out all the updated data
    var jsonData = {
      status: "Deleted "+requestedName
    }
    console.log(jsonData);
    res.redirect('/people');
  })
  
})








module.exports = router;







