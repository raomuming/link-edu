
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

let CourseSchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: ""
	},
	creator: Number,
	cover: {
		type: String,
		trim: true,
		default: ""
	},
	created_at: {
		type: Number,
		default: Date.now()
	},
	modified_at: Number
}, SchemaOptions);

CourseSchema.plugin(autoIncrement.plugin, {
	model: "Course",
	startAt: 1
});

let Course = mongoose.model("Course", CourseSchema);

module.exports = Course;