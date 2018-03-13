
var Cluster = require('cluster');
var OS = require('os');
var _ = require('underscore');


var APIServer = require('../lib/api/APIServer').APIServer;

var Workers_Ready = {};
var Dead_Workers = [];
var Worker_Info = {};

var dont_spawn_new_workers = false;

if (Cluster.isMaster) {
	console.log('master is starting...');
	start_workers();

	// Listen to signals sent to the master cluster process and handle appropriately
	//
	// SIGTERM (kill) - do a clean shutdown
	process.on('SIGTERM', function(){
		console.log("Got SIGTERM");
		dont_spawn_new_workers = true;

		for (let id in Cluster.workers) {
			Cluster.workers[id].send({shutdown: true});
			Cluster.workers[id].disconnect();
		}
	});
}
else {
	console.log('slave is starting..., process id ' + process.id);
	var api_server = new APIServer();
	console.log('starting instance...');

	let time_to_start = 30000;
	let start_up_timeout = setTimeout(() => {
		console.warn(`Worker was unable to start in ${time_to_start}ms`);
		process.exit(1);
	}, time_to_start).unref();

	api_server.start(() => {
		clearTimeout(start_up_timeout);
		start_up_timeout = null;
	});

	global.Api = api_server;
}


function start_workers() {
	console.log('API server starting up...');
	var num_CPUs = OS.cpus().length;
	console.log(num_CPUs + ' CPUs discored, forking instances...');
	for (var index = 0; index < num_CPUs; index++) {
		// specifically identify the first instance
		Cluster.fork(index == 0 ? {FIRST_NODE_FORK: 1} : null);
	}

	// revive dead instances
	Cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.id + '(process ' + worker.process.pid + ' ) died with exit code: ' + code 
			+ ' and signal: ' + signal);

		if (code === 3) dont_spawn_new_workers = true;

		Dead_Workers.push({
			dead_worker_id: worker.id,
			sequence_number: Worker_Info[worker.id].sequence_number,
		});

		if (Workers_Ready) {
			delete Workers_Ready[worker.id];
		}

		// if the cluster process sends an explicit shutdown message to the workers,
		// we obvisouly dont want to auto-revive them
		if (dont_spawn_new_workers) {
			if (code === 3) {
				console.log("fatal error; unable to spawn worker threads wihout them immediately dying");
			}
			else {
				console.log("got shutdown; will not restart worker threads");
			}
		}
		else {
			Cluster.fork();
		}
	});

	// just a quick message to track when master process sends an explicit
	// disconnect to the worker
	Cluster.on('disconnect', function(worker){
		if (dont_spawn_new_workers === true) {
			console.log("Worker disconnect from cluster pool >" + worker.process.pid + "<");
		}
	});

	// handle worker online
	Cluster.on('online', function(worker) {
		console.log('Worker ' + worker.id + ' is online');
		var worker_info = {
			sequence_number: Object.keys(Worker_Info).length,
		};
		Worker_Info[worker.id] = worker_info;
		var message = {
			worker_id: worker.id,
			sequence_number: worker_info.sequence_number,
			num_workers: num_CPUs,
		};

		console.log('send message after worker online, message: ' + JSON.stringify(message));
		if (Dead_Workers.length > 0) {
			_.extend(message, Dead_Workers.shift());
		}
		worker.send(message);
		if (Workers_Ready) {
			Workers_Ready[worker.id] = false;
		}

		worker.on('message', function(message){
			console.log('receive message:' + JSON.stringify(message));
			if (message.ready) {
				if (Workers_Ready) {
					Workers_Ready[message.id] = true;
					var all_workers_ready = true;
					for (var id in Workers_Ready) {
						if (!Workers_Ready[id]) {
							all_workers_ready = false;
							break;
						}
					}

					// dont allow workers to listen unitl all workers are ready with initialization
					if (all_workers_ready) {
						console.log('ALL WORKERS READY!');
						Workers_Ready = null;
						for (var id in Cluster.workers) {
							Cluster.workers[id].send({go: true});
						}
					}
				}
				else {
					console.log("No need to wait for all workers, GO!");
					Cluster.workers[message.id].send({go: true});
				}
			}
			else if (message.fatal) {
				console.log('Worker ' + message.id + ' signalled fatal error, can not continue.');
				process.exit(1);
			}
			else if (message.done) {
				console.log('Process complete.');
				process.exit(1);
			}
			else if (message.do_timeout) {

			}
			else if (message.clear_timeout) {

			}
		});
	});
}