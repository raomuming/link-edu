
var _ = require('underscore');
var Cluster = require('cluster');
var HTTP = require('http');
var Async = require('async');
var Express = require('express');

var MongoUtils = require('../mongo/mongoUtils.js')

var APIServer = function(options) {
	var self = this;

	self.is_ready = false;
	// handle communication with master cluster
	process.on('message', _.bind(self._handle_message_from_master, this));

	// initialize express and express middleware
	self.express = Express();
};

APIServer.prototype.start = function(callback) {
	var self = this;

	// start all the services here
	Async.series([
		function(callback) {
			// register all routes
			console.log('Registering routes...');
			self._register_routes();
			callback();
		},
		function(callback) {
			let db = MongoUtils.connect();
			if (db) {
				callback();
			}
			else {
				callback("can not connect to mongodb.");
			}
		}
		], function(error){
			if (error) {
				console.error(error);
				return process.exit(1);
			}
			console.log('Worker is ready');
			
			if (self.is_ready) {
				console.log('Worker ==> after start: ' + self.worker_id + ' sent ready message');
				process.send({ready: true, id: self.worker_id});
			}
			else {
				self.is_ready = true;
			}
			if (callback) {
				Async.nextTick(callback);
			}
		});
};

APIServer.prototype._handle_message_from_master = function(message) {
	var self = this;
	console.log('message received by _handle_message_from_master: ' + JSON.stringify(message));
	if (message.worker_id) {
		_.extend(self, message);

		if (self.is_ready) {
			console.log('Worker ==> from master: ' + self.worker_id + ' sent ready message');
			process.send({ready: true, id: self.worker_id});
		} else {
			self.is_ready = true;
		}
	}
	else if (message.go) {
		// start listening
		console.log('Starting server listening...');
		self._start_listening( ()=> {
			console.log('API Server listening on port: 3000');
		});
	}
	else if (message.handle_timeout) {
		self._handle_timeout(message);
	}
	else if (message.shutdown) {
		self._handle_shutdown_message(message);
	}
};

// purpose: starting listening
// warning: process dies on failure
// returns: nothing
APIServer.prototype._start_listening = function(callback) {
	console.log('Start listening on port 3000');
	var self = this;
	self.http_server = HTTP.createServer(
		this.express
	).listen(3000);

	self.http_server.on('error', (error) => {
		if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
			console.error('Unable to start http server on port: 3000, error: ' + error);
			// sending exit code 3 will tell the parent process to not respawn
			process.exit(3);
		}
		else {
			console.log('Killing worker because ' + error);
			process.exit(1);
		}
	});

	self.http_server.on('listening', () => {
		callback();
	});

	self._http_sockets = [];
	self.http_server.on('connection', (socket) => {
		self._http_sockets.push(socket);
		socket.on('close', () => {
			self._http_sockets.splice(self._http_sockets.indexOf(socket), 1);
		});
	});

	self.http_server.on('checkContinue', (request, response) => {
		request._expectHeaderReceived = true;
		self.http_server.emit('request', request, response);
	});
};

APIServer.prototype._handle_timeout = function(message) {

};

APIServer.prototype._handle_shutdown_message = function(message) {
	console.log("Got shutdown signal from Cluster master.");
	let self = this;
	let pid = "PID " + process.pid + ": ";

	Async.parallel([
		function(callback) {
			console.log(pid + "shutting down HTTP server");
			self.http_server.removeAllListeners('close');
			self.http_server.close((error) => {
				console.log(pid + " HTTP server shutdown");
				callback(error, pid + " HTTP server shut down");
			});
		},
		function(callback) {
			const destroy_sockets = function() {
				let http_count = 0;
				for (let i = 0; i < self._http_sockets.length; i++) {
					self._http_sockets[i].destroy();
					http_count ++;
				}

				if (http_count > 0) {
					console.log(pid + http_count + " HTTP sockets destroyed.");
				}

				callback(null, pid + http_count + " sockets destroyed in total.");
			};
			setTimeout(destroy_sockets, 1000);
		},
		function(callback) {
			let interval;
			const check_threads = function(){

			};
		}
		], function(error, results){
			if (error) {
				console.error(pid + " Clould not shut down cleanly", error);
				process.exit(1);
			}
			else {
				console.log(pid + " Shut down complete", error);
				process.exit(0);
			}
		});
};

APIServer.prototype._register_routes = function() {
	let self = this;
	self._register_for_all_routes();
	self._register_collection_routes();
};

APIServer.prototype._register_for_all_routes = function() {
	let self = this;
	self.express.all('*', function(request, response, next){
		response.set({
			'Content-Type': 'application/json'
		});
		next();
	});
};

APIServer.prototype._register_collection_routes = function() {
	// right now, for testing only
	let self = this;
	self.express.all('*', (request, response) => {
		response.status(200).send({'status' : '200 OK'});
	});
};

exports.APIServer = APIServer;