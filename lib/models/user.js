
let mongoose = require('mongoose');
let autoIncrement = require('mongoose-auto-increment');
let Schema = mongoose.Schema;

let SchemaOptions = {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
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

	/*
	profile: {
		name: { type: String },
		gender: { type: String },
		picture: { type: String },
		location: { type: String }
	}*/
	/*,
	roles: {
		type: [
			type: String,
			"enum": {
				"student",
				"teacher"
			}
		],
		"default": ['student']
	}*/
}, SchemaOptions);

// auto increment for `_id`
UserSchema.plugin(autoIncrement.plugin, {
	model: "User",
	startAt: 1
});

let User = mongoose.model("User", UserSchema);

module.exports = User;