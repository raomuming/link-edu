
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
		User.findOne(user_query, (error, user) => {
			console.log('user => =>', user);
			if (error) {
				console.log('cannot find the creator.');
				response.status(403).send(error);
				return;
			}
			console.log('prepare course body');
			let body = request.body;
			delete body.open_id;
			delete body.union_id;
			body.creator = user._id;

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
		let id = parseInt(request.params.id, 10);
		console.log('update course of _id => ', id);

		let updateBody = request.body;

		Course.update({_id: id}, updateBody, (error, result) => {
			console.log('error => ', error, 'nums => ', result);
			if (error) {
				response.status(403).send(error);
			}
			else {
				Course.findOne({_id: id}, (error, course) => {
					if (error) {
						response.status(403).send(error);
					}
					else {
						response.status(200).send(course);
					}
				});
			}
		});
	});

	// get by id
	app.get('/course/:id', function (request, response) {
		let id = parseInt(request.params.id, 10);
		console.log('get course of _id => ', id);

		Course.findOne({_id: id}, (error, course) => {
			if (error) {
				console.log('cannot find course of id => ', id);
				response.status(404).send(error);
				return;
			}
			response.status(200).send(course);
		});
	});

	// get by ids
	app.get('/courses', function (request, response) {
		//response.status(200).send([{}, {}]);
		Course.find((error, courses) => {
			response.status(200).send(courses);
		});
	});
};