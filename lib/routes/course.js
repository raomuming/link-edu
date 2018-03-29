
let Course = require('../models/course.js');
let User = require('../models/user.js');
let Async = require('async');

module.exports = function(app) {
	console.log('register course routes.');
	let self = this;

	// put method - create a new course
	app.put('/course', function (request, response) {
		console.log('start creating course');
		let user_query = {};
		if (request.body.union_id) {
			user_query.union_id = request.body.union_id;
		}
		else if (request.body.open_id) {
			user_query.open_id = request.body.open_id;
		}
		console.log('open_id => ', request.body.open_id);
		User.find(user_query, (error, users) => {
			console.log('user => =>', users[0]);
			if (error) {
				console.log('cannot find the creator.');
				response.status(403).send(error);
				return;
			}
			console.log('prepare course body');
			let body = request.body;
			delete body.open_id;
			delete body.union_id;
			body.creator = users[0]._id;

			let course = new Course(body)
			course.save((error, course) => {
				console.log('create a course, error => ', error);
				if (error) {
					response.status(403).send(error);
					return;
				}

				console.log('create a course successfully => ', course);
				response.status(200).send(course);
			});
		});
	});

	// post method - update a certain course
	app.post('/course/:id', function (request, response) {

	});

	// get by id
	app.get('/course/:id', function (request, response) {

	});

	// get by ids

};