// CUSTOM JS FILE //
var browserLat;
var browserLong;

var geojson = []; // array to hold map markers
var markerCounter = 0; //hacky callback for when I've filled up the geojson array with all pins from get request
var tipsCounter = 0; //hacky callback for when I've looped through 5 tips

var moreInfoOpen = false; //boolean for the more info div

function init() {
	getUserLocation();
	calculateMapWidth();
}

function getUserLocation() {
	// check for Geolocation support
	if (navigator.geolocation) {
  		console.log('Geolocation is supported!');
	}
	else {
  		console.log('Geolocation is not supported for this Browser/OS version yet.');
	}

	var startPos;
	var geoOptions = {
	     timeout: 10 * 1000
	}

	var geoSuccess = function(position) {
	    startPos = position;
	    browserLat = startPos.coords.latitude;
	    browserLong = startPos.coords.longitude;
	    getAllPins();
	 };
	var geoError = function(error) {
	    console.log('Error occurred. Error code: ' + error.code);
	    // error.code can be:
	    //   0: unknown error
	    //   1: permission denied
	    //   2: position unavailable (error response from location provider)
	    //   3: timed out
	};

	navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
}

function calculateMapWidth(){
	var windowWidth = $( window ).width();
	var menuWidth = $( "#leftMenu" ).width();
	var mapWidth = windowWidth - menuWidth;
	$("#mapContainer").css({"width": mapWidth});
}

function resize(){
	//console.log("hit");
	calculateMapWidth();
}

//animations for add place overlay
(function () {
	var triggerBttn = document.getElementById( 'addButton' ),
		overlay = document.querySelector( 'div.overlay' ),
		closeBttn = overlay.querySelector( 'button.overlay-close' );
		transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { transitions : Modernizr.csstransitions };

	function toggleOverlay() {
		//console.log("hit");
		if( classie.has( overlay, 'open' ) ) {
			classie.remove( overlay, 'open' );
			classie.add( overlay, 'close' );
			var onEndTransitionFn = function( ev ) {
				if( support.transitions ) {
					if( ev.propertyName !== 'visibility' ) return;
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
				$('#scrollListings').empty();
				document.getElementById('searchInput').value = "";
				classie.remove( overlay, 'close' );
			};
			if( support.transitions ) {
				overlay.addEventListener( transEndEventName, onEndTransitionFn );
			}
			else {
				onEndTransitionFn();
			}
		}
		else if( !classie.has( overlay, 'close' ) ) {
			classie.add( overlay, 'open' );
		}
	}

	triggerBttn.addEventListener( 'click', toggleOverlay );
	closeBttn.addEventListener( 'click', toggleOverlay );
})();

function getSearchResults(event){

	$('#scrollListings').empty();

	//get search term and make it into a readable format for the API get request
	var searchTerm = document.getElementById('searchInput').value;
	// if there is no value, or it is an empty string, prompt the user
	if(!searchTerm || searchTerm=="") return alert("Enter a Location");

	var searchTermSlug = searchTerm.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_');

	jQuery.ajax({
		url : '/api/get/foursquare/search/'+browserLat+'/'+browserLong+'/'+searchTermSlug,
		type: 'GET',
		dataType : 'json',
		failure: function(err){
	    	return console.log ("error: " + err);
	    },
		success : function(response) {

			var venues = response.response.venues;
			//console.log(venues);

			resultsLength = venues.length;

			for(var i=0;i<venues.length;i++){
				var venueName = venues[i].name;
				var venueID = venues[i].id;
				var venueAddress = venues[i].location.address;
				var venueCity = venues[i].location.city;
				var venueState = venues[i].location.state;
				var venueZip = venues[i].location.postalCode;
				var venueLat = venues[i].location.lat;
				var venueLong = venues[i].location.lng;
				var pinType;

				//Extract primary category from category URL
				var categoryUrl = venues[i].categories[0].icon.prefix;
				var categoryUrlSplit = categoryUrl.split("/");
				var locationType = categoryUrlSplit[5];
				//console.log(locationType);

				if (locationType=="food"){
					pinType = "http://s18.postimg.org/6hw9hf1o5/shoppin.png";
				}

				else if (locationType=="nightlife"){
					pinType = "http://s24.postimg.org/qxzx7jgvl/barpin.png";
				}

				else {
					pinType = "http://s28.postimg.org/tce43lma1/restpin.png";
				}

				getVenuePhoto(venueName,venueID,venueAddress,venueCity,venueState,venueZip,venueLat,venueLong,locationType, pinType);

			} 
		}
	})	
}

function getVenuePhoto(venueName,venueID,venueAddress,venueCity,venueState,venueZip,venueLat,venueLong,locationType, pinType){

	jQuery.ajax({
		url : '/api/get/foursquare/venue/'+venueID,
		type: 'GET',
		dataType : 'json',
		failure: function(err){
	    	return console.log ("error: " + err);
	    },
		success : function(response) {

			var venue = response.response.venue;
			//var locationPrice = venue.price.currency;
			var venueTips = []; 

			var latestPhotoPrefix = venue.photos.groups[0].items[0].prefix;
			var photoSize = "300x300";
			var latestPhotoSuffix = venue.photos.groups[0].items[0].suffix;
			var photoUrl = latestPhotoPrefix.concat(photoSize,latestPhotoSuffix);

			appendHTML(venueName,venueID,venueAddress,venueCity,venueState,venueZip,venueLat,venueLong,locationType,pinType,photoUrl,venueTips);


			// if (venue.tips.count==0){
			// 	appendHTML(venueName,venueID,venueAddress,venueCity,venueState,venueZip,venueLat,venueLong,locationType,pinType,photoUrl,venueTips);
			// 	console.log("hit");
			// }

			// if (venue.tips.groups[0]) {
			// 	for(var i=0;i<5;i++){
			// 		var tip;
			// 		if(venue.tips.groups[0].items[i]) tip = venue.tips.groups[0].items[i].text;
			// 		else continue;
			// 		venueTips.push(tip);
			// 		tipsCounter++;

			// 		if (tipsCounter==5){
			// 			console.log(venueTips);
			// 			appendHTML(venueName,venueID,venueAddress,venueCity,venueState,venueZip,venueLat,venueLong,locationType,pinType,photoUrl,venueTips);
			// 		}
			// 	}
			// }
		}
	})	
}

function appendHTML(venueName,venueID,venueAddress,venueCity,venueState,venueZip,venueLat,venueLong,locationType,pinType,photoUrl){

	var htmlToAppend =
	        '<div class="searchListing" onclick="searchListingClick(event)">'+
	          '<div class="imageAndPin">'+
	            '<img class="venueImage" src="'+photoUrl+'">'+
	            '<div class="pinContainer">'+
	            '<img src="'+pinType+'">'+
	            '</div>'+
	          '</div>'+

	          '<div class="listingContent">'+
	            '<h2 class="venueNameHolder">'+venueName+'</h2>'+
	            '<p class="venueTypeHolder">'+locationType+'</p>'+
	            '<p class="venueAddressHolder">'+venueAddress+', '+venueCity+', '+venueState+' '+venueZip+'</p>'+
	          '</div>'+
	          '<div class="hiddenInfo">'+
	            '<p class="venueIdHolder">'+venueID+'</p>'+
	            '<p class="venueLatHolder">'+venueLat+'</p>'+
	            '<p class="venueLongHolder">'+venueLong+'</p>'+
	          '</div>'+
	        '</div>';

	$('#scrollListings').append(htmlToAppend);

}

function searchListingClick(event){

   var target = event.target || event.srcElement;
   //var targetHTML = target.innerHTML;

   var locationName = $(target).find('.venueNameHolder').text();
   var locationType = $(target).find('.venueTypeHolder').text();
   var locationAddress = $(target).find('.venueAddressHolder').text();
   var foursquareId = $(target).find('.venueIdHolder').text();
   var latitude = parseFloat($(target).find('.venueLatHolder').text());
   var longitude = parseFloat($(target).find('.venueLongHolder').text());
   var locationImage = $(target).find('.venueImage').attr("src");

   //console.log(locationName);
   // console.log(venueType);
   // console.log(venueAddress);
   //console.log(foursquareId);
   // console.log(venueLat);
   // console.log(venueLong);
   // console.log(venueImage);

   jQuery.ajax({
  	url : '/api/post/savepin',
  	dataType : 'json',
  	type : 'POST',
  	// we send the data in a data object (with key/value pairs)
  	data : {
		locationName : locationName,
		foursquareId : foursquareId,
		locationAddress : locationAddress,
		latitude : latitude,
		longitude : longitude,
		locationType : locationType,
		locationImage : locationImage
  	},
  	success : function(response){
  		if(response.status=="OK"){
	  		// success
	  		console.log(response);
  		}
  		else {
  			alert("something went wrong");
  			console.log(response);
  		}
  	},
  	error : function(err){
  		// do error checking
  		alert("something went wrong");
  		console.error(err);
  	}
  }); 
}

function getAllPins(){


	jQuery.ajax({
		url : '/api/get/allpins',
		type: 'GET',
		dataType : 'json',
		failure: function(err){
	    	return console.log ("error: " + err);
	    },
		success : function(response) {

			var pins = response.pins;

			if (pins.length==0){
				loadMapAndPins();
			}

			for(var i=0;i<pins.length;i++){
				var locationName = pins[i].locationName;
				var locationAddress = pins[i].locationAddress;
				var latitude = pins[i].latitude;
				var longitude = pins[i].longitude;
				var locationType = pins[i].locationType;
				var pinType;
				var id = pins[i]._id;

				if (locationType=="food"){
					pinType = "img/restaurantpin.png";
				}

				else if (locationType=="nightlife"){
					pinType = "img/barpin.png";
				}

				else {
					pinType = "img/otherpin.png";
				}

				 var markerObject = {
	   				 "type": "Feature",
		   			 "geometry": {
      					"type": "Point",
      					"coordinates": [longitude,latitude] //MongoDB or Mapbox seem to only understand when longitude is first
    				},
    				"properties": {
				      "title": locationName,
				      "description": locationAddress,
				      "id": id,
				      "icon": {
				          "iconUrl": pinType,
				          "shadowUrl": "img/pinshadow.png",
				          "iconSize": [30, 43], // size of the icon
				          "shadowSize":   [47, 28], // size of the shadow
				          "iconAnchor": [25, 42], // point of the icon which will correspond to marker's location
				          "shadowAnchor": [34, 10],  // the same for the shadow
				          "popupAnchor": [0, -25], // point from which the popup should open relative to the iconAnchor
				          "className": "dot"
				     }
				   }
				 };

  				//console.log(markerObject);

  				geojson.push(markerObject);

  				markerCounter++;
  				if (markerCounter==pins.length) {
  					//console.log(geojson);
  					loadMapAndPins();
  					markerCounter=0;
  				};
			}

		}
	})	
}

function loadMapAndPins(){
	L.mapbox.accessToken = 'pk.eyJ1IjoiZ3JlZ2hvdXNzZXQiLCJhIjoiY2lncGQ4bTd6MDByMnY2a29hZ2ViN2V4dCJ9.svTgvULdgpLTMkCSc2YsSg';
    var map = L.mapbox.map('map', 'greghousset.o3mpkhdm').setView([browserLat, browserLong], 15);
    var markerLayer = L.mapbox.featureLayer().addTo(map);

    //console.log(geojson);

    // Set a custom icon on each marker based on feature properties.
	markerLayer.on('layeradd', function(e) {
		console.log("hit");
	  	var marker = e.layer,
	    feature = marker.feature;
	  	marker.setIcon(L.icon(feature.properties.icon));
	  	var content = '<div id="pinId">'+ feature.properties.id+'</div>';
	  	marker.bindPopup(content);
	});

	markerLayer.setGeoJSON(geojson);
	//map.scrollWheelZoom.disable();

	//click event on map pin and animte more info div
	markerLayer.on('click', function(e) {
		var venueId = $('#pinId').html();
		console.log(venueId);
		if (moreInfoOpen==false){

			jQuery.ajax({
				url : '/api/get/pinlocation/'+venueId,
				type: 'GET',
				dataType : 'json',
				failure: function(err){
			    	return console.log ("error: " + err);
			    },
				success : function(response) {

					var pin = response.pins;
					var locationName = pin.locationName;
					var locationAddress = pin.locationAddress;
					var image = pin.locationImage;
					var type = pin.locationType;

					$("#image").attr("src", image);
					$("#locName").text(locationName);
					$("#locAdd").text(locationAddress);
					$("#locType").text(type);

				}
			})

			$("#moreInfo").animate({'left':'0px'},200,"swing",function(){
			});
			moreInfoOpen = !moreInfoOpen;

		}

		else {
			$("#moreInfo").animate({'left':'-351px'},200,"swing",function(){
			});
			moreInfoOpen = !moreInfoOpen;
		}
	});
}




// $(document).click(function(e) {
// 	if ( $(e.target).closest('#bottomPanel').length === 0 && fromSelection===false) {
//     	$("#bottomPanel").animate({'top':'93.28%'},300,"swing",function(){
// 		$('#canvasSize').css({'height':'93.28%'});
// 	});
// 	}
// });

// on change of theInput field, lets run the script to get the search term query
document.getElementById('searchInput').addEventListener('change', getSearchResults);

window.addEventListener('load', init);
window.addEventListener("resize", resize);
