// CUSTOM JS FILE //

function init() {
	getUserLocation();
	calculateMapWidth();
	loadMap();
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
	    document.getElementById('container').innerHTML = startPos.coords.latitude;
	    document.getElementById('container').innerHTML = startPos.coords.longitude;
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

function loadMap(){
	L.mapbox.accessToken = 'pk.eyJ1IjoiZ3JlZ2hvdXNzZXQiLCJhIjoiY2lncGQ4bTd6MDByMnY2a29hZ2ViN2V4dCJ9.svTgvULdgpLTMkCSc2YsSg';
    var map = L.mapbox.map('map', 'greghousset.o3mpkhdm').setView([40.77, -73.971], 14);
}

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




window.addEventListener('load', init())
window.addEventListener("resize", resize);
