
let User = require('../models/user.js');
let Async = require('async');
let WXUtils = require('../utils/WXUtils.js');


module.exports = function(app) {
	console.log('register user routes.');
	let self = this;
	// for user to login
	app.put("/login", function(req, res) {
		console.log('body=>', req.body);

		Async.waterfall([
			function(callback) {
				let code = req.body.code;
				let cryptedData = req.body.crypted_data;
				let iv = req.body.iv;
				WXUtils.decryptWxUserData(code, cryptedData, iv, (error, decryptedData) => {
					if (error){
						console.log(JSON.stringify(error));
						callback(error);
					} else {
						console.log('decryptedData => ', JSON.stringify(decryptedData));
						callback(null, decryptedData);
					}
				});
			},
			function (decryptedData, callback) {
				// check the user, if exists update, if not create one
				console.log('decryptedData => ', decryptedData);
				User.find({openId: decryptedData.openId}, (error, users) => {
					console.log("user find error =>", JSON.stringify(error));
					if (error) {
						console.log('=>error');
						callback(error);
					} else {
						console.log('=>no error, users type => ', typeof users);
						console.log('users => ', JSON.stringify(users));
						if (users.length > 0) {
							console.log('users length > 0');
							// TODO: update the user.
							callback(null, users[0]);
						} else {
							console.log('trying to create a new user.');
							let user = new User({
								nickName: decryptedData.nickName,
								unionId: decryptedData.unionId,
								openId: decryptedData.openId
							});
							user.save((error, user) => {
								if (error) {
									console.log('error when save user =>', JSON.stringify(error));
									callback(error);
								}
								else {
									console.log('new user created =>', JSON.stringify(user));
									callback(null, user);
								}
							});
						}
					}
				});
			}
			], function(error, user) {
				res.send(error ? error : user);
			});
	});
};