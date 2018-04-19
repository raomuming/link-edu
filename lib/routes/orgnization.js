
let Orgnization = require('../models/orgnization.js');
let User = require('../models/user.js');

module.exports = function(app) {
	console.log('register orgnization routes.');
	let self = this;

	app.put('/orgnization', function(request, response){
		console.log('start creating orgnization.');
		let user_query = {};
		if (request.body.union_id) {
			user_query.union_id = request.body.union_id;
		} else if (request.body.open_id) {
			user_query.open_id = request.body.open_id;
		}

		User.findOne(user_query, (error, user) => {
			console.log('find a user => ', user);
			if (error) {
				console.log('cannot find the creator');
				response.status(403).send(error);
				return;
			}
			console.log('prepare orgnization body');
			let body = request.body;
			delete body.open_id;
			delete body.union_id;
			body.creator = user._id;
			body.created_at = Date.now();

			let orgnization = new Orgnization(body);
			orgnization.save((error, orgnization) => {
				console.log('create a orgnization, error => ', error);
				if (error) {
					response.status(403).send(error);
					return;
				}

				let id = orgnization._id;
				if (user.orgnizations) {
					if (user.orgnizations.indexOf(id) === -1) {
						user.orgnizations.push(id);
					}
				} else {
					user.orgnizations = [id];
				}

				console.log('create orgnization successfully.');

				User.update(user, (error, result) => {
					console.log('update user after create orgnization error =>');
					if (error) {
						response.status(403).send(error);
					}
					else {
						response.status(200).send(orgnization);
					}
				});
			});
		});
	});
};