
let mongoose = require('mongoose');
let autoIncrement = require('mongoose-auto-increment');
let Schema = mongoose.Schema;

let SchemaOptions = {
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	},
	id: false,
};

let OrgnizationSchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: ""
	},
	description: {
		type: String,
		trim: true,
		default: ""
	},
	created_at: {
		type: Number,
		default: Date.now()
	},
	creator: {
		type: Number,
		ref: "User"
	}
}, SchemaOptions);

// auto increment for '_id'
OrgnizationSchema.plugin(autoIncrement.plugin, {
	model: "Orgnization",
	startAt: 1
});

let Orgnization = mongoose.model("Orgnization", OrgnizationSchema);

module.exports = Orgnization;