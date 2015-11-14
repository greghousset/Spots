// CUSTOM JS FILE //
var browserLat;
var browserLong;

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
	    loadMap(browserLat,browserLong);
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
	console.log("hit");
	calculateMapWidth();
}

function loadMap(browserLat,browserLong){
	L.mapbox.accessToken = 'pk.eyJ1IjoiZ3JlZ2hvdXNzZXQiLCJhIjoiY2lncGQ4bTd6MDByMnY2a29hZ2ViN2V4dCJ9.svTgvULdgpLTMkCSc2YsSg';
    var map = L.mapbox.map('map', 'greghousset.o3mpkhdm').setView([browserLat, browserLong], 14);
}

//animations for add place overlay
(function() {
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
		console.log("hit");
		if( classie.has( overlay, 'open' ) ) {
			classie.remove( overlay, 'open' );
			classie.add( overlay, 'close' );
			var onEndTransitionFn = function( ev ) {
				if( support.transitions ) {
					if( ev.propertyName !== 'visibility' ) return;
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
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

	//get search term and make it into a readable format for the API get request
	var searchTerm = document.getElementById('searchInput').value;
	// if there is no value, or it is an empty string, prompt the user
	if(!searchTerm || searchTerm=="") return alert("Enter a Location");

	var searchTermSlug = searchTerm.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_');

	jQuery.ajax({
		url : 'https://api.foursquare.com/v2/venues/suggestcompletion?client_id=3OBERKRJQSQIB054ALCOEGGM4AU1CG12O3KYPO1ENSB2W4J3&client_secret=XB3XNDQ4MQU01Z4AM2I4WYGW1GZ253XSBB5YHLK253NJZLR1&v=20130815&ll='+browserLat+','+browserLong+'&limit=10&query='+searchTermSlug,
		dataType : 'jsonp',
		success : function(response) {

			var venues = response.minivenues;
			console.log(venues);

			for(var i=0;i<venues.length;i++){
				var venueName = venues[i].name;
				var venueID = venues[i].id;
				var venueAddress = venues[i].location.address;
				var venueCity = venues[i].location.city;
				var venueState = venues[i].location.state;
				var venueZip = venues[i].location.postalCode;
				var venueLat = venues[i].location.lat;
				var venueLong = venues[i].location.lng;			}
				console.log(venueName);
			}
	})	


}


// on change of theInput field, lets run the script to get the search term query
document.getElementById('searchInput').addEventListener('change', getSearchResults);

window.addEventListener('load', init())
window.addEventListener("resize", resize);
