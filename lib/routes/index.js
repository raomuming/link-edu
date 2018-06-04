
module.exports.register_models_routes = function(app) {
	require('./user')(app);
	require('./course')(app);
	require('./orgnization')(app);
	require('./teacher')(app);
}