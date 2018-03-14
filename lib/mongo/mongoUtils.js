
'use strict';

let mongoose = require('mongoose');
let autoIncrement = require('mongoose-auto-increment');

let config = require('../../config.json');

module.exports.connect = function(callback) {
	let db;
	console.log(config.db.options)
	mongoose.Promise = global.Promise;

	if (mongoose.connection.readyState !== 1) {
		console.log('Connection to mongo ' + config.db.uri + '...');
		db = mongoose.connect(config.db.uri, config.db.options, (err) => {
			if (err) {
				console.error('Could not connect to mongoDB!');
				return;
			}
		});

		autoIncrement.initialize(mongoose.connection);

		mongoose.connection.on('error', (err) => {
			if (err.message.code === 'ETIMEDOUT') {
				console.warn('mongo connection timeout!', err);
				setTimeout(() => {
					mongoose.connect(config.db.uri, config.db.options);
				}, 1000);
				return;
			}
			console.error('Could not connect to mongoDB');
		});

		mongoose.connection.once('open', () => {
			console.log('mongo DB connected.');
		});
	}
	else {
		console.log('mongo already connected.');
		db = mongoose;
	}

	return db;
};