var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var placeSchema = new Schema({
	// name: {type: String, required: true}, // this version requires this field to exist
	// name: {type: String, unique: true}, // this version requires this field to be unique in the db
	userId: String,
	name: String,
	latitude: Number,
	longitude: Number,
	locationType: String,
	price: String,
	neighborhood: String,
	cuisine: String,
	vibe: String,
	image: String,
	food: String,
	url: String,
	//dateAdded : { type: Date, default: Date.now }
})

// export 'Place' model so we can interact with it in other files
module.exports = mongoose.model('Place',placeSchema);