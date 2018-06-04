
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
	id: false
};

let TeacherSchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: "",
	},
	phone_number: {
		type: String,
		trim: true,
		default: ""
	},
	password: {
		type: String,
		trim: true,
		default: ""
	}
}, SchemaOptions);

TeacherSchema.plugin(autoIncrement.plugin, {
	model: "Teacher",
	startAt: 314159	// magic number
});

let Teacher = mongoose.model("Teacher", TeacherSchema);

module.exports = Teacher;