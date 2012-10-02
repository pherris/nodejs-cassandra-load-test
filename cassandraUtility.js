var PooledConnection 		= require('cassandra-client').PooledConnection,
	config					= require('./config.js'),
	connection_pool,
	logger			 		= require('./logger.js')(config.debugLevel),
	connectionConfiguration = config.cassandraPoolConnection;

//This creates the connection pool...	
exports.doPoolConnect = function (callback) {
	//only create connection once...
	if (connection_pool) { 
		callback(connection_pool);
		return;
	}
	
	connection_pool = new PooledConnection(connectionConfiguration);
	
	connection_pool.on('log', function(level, message, obj) {
		logger.debug('Query log event: ' + level + ' -- ' + message);
	})
	
	if (callback) callback();
};

//executes CQL statement against the connection pool and returns the time taken to the callback.
exports.query = function (cql, params, callback) {
	var start = new Date();
	var error = false;
	
	connection_pool.execute(cql, params, function (err) {
	    if (err) {
			//logger.error(err);
			error = true;
	    }
		var end = new Date();
		var timeTaken = end.getTime() - start.getTime();
		
		if (callback) callback(error, timeTaken);
	});
};


//closes the connection pool...
exports.doPoolClose = function (callback) {
	connection_pool.shutdown(function() {
		// no error object by design.
		logger.info("disconnected");
		if (callback) callback();
	});
};