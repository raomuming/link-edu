
let User = require('../models/user.js');
let Async = require('async');
let WXUtils = require('../utils/WXUtils.js');


module.exports = function(app) {
	console.log('register user routes.');
	let self = this;
	// for user to login
	app.post("/login", function(req, res) {
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
				User.find({open_id: decryptedData.openId}, (error, users) => {
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
							let updateBody = {
								nick_name: decryptedData.nickName,
								avatar_url: decryptedData.avatarUrl
							};
							
							User.update({_id: users[0]._id}, updateBody, (error, result) => {
								console.log('error => ', error, 'nums => ', result);
								if (error) {
									callback(error, null);
								} else {
									User.findOne({_id: users[0]._id}, (error, user) => {
										callback(error, user);
									});
								}
							});
						} else {
							console.log('trying to create a new user.');
							let user = new User({
								nick_name: decryptedData.nickName,
								union_id: decryptedData.unionId,
								open_id: decryptedData.openId,
								avatar_url: decryptedData.avatarUrl
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