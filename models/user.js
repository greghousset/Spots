var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var userSchema = new Schema({
	name: String,
	phoneNumber: String,
	slug: { type: String, lowercase: true, required: true, unique: true },
	imageUrl: String
	//dateAdded : { type: Date, default: Date.now }
})

// export 'Person' model so we can interact with it in other files
module.exports = mongoose.model('User',userSchema);