
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

let UserSchema = new Schema({
	nickName: {
		type: String,
		trim: true,
		"default": "",
	},
	
	unionId: {
		type: String
	},

	openId: {
		type: String,
		unique: true,
		index: true
	}
}, SchemaOptions);

// auto increment for `_id`
UserSchema.plugin(autoIncrement.plugin, {
	model: "User",
	startAt: 1
});

let User = mongoose.model("User", UserSchema);

module.exports = User;