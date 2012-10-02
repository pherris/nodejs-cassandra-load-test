var PooledConnection 	= require('cassandra-client').PooledConnection,
	logger			 	= require('./logger.js')("info"),
	connection_pool,
	connectionConfiguration = {
		hosts 		: [
						"ec2-50-18-25-6.us-west-1.compute.amazonaws.com:9160",
						"ec2-184-169-218-212.us-west-1.compute.amazonaws.com:9160",
						"ec2-50-18-87-94.us-west-1.compute.amazonaws.com:9160",
						"ec2-204-236-137-212.us-west-1.compute.amazonaws.com:9160",
						"ec2-184-169-233-15.us-west-1.compute.amazonaws.com:9160",
						"ec2-50-18-10-229.us-west-1.compute.amazonaws.com:9160",
						"ec2-50-18-148-155.us-west-1.compute.amazonaws.com:9160",
						"ec2-184-169-241-248.us-west-1.compute.amazonaws.com:9160",
						"ec2-184-169-221-232.us-west-1.compute.amazonaws.com:9160",
						"ec2-204-236-190-125.us-west-1.compute.amazonaws.com:9160",
						"ec2-184-169-238-200.us-west-1.compute.amazonaws.com:9160",
						"ec2-50-18-29-235.us-west-1.compute.amazonaws.com:9160"
					],
		keyspace 	: "midstore",
		maxSize 	: 25,
		use_bigints	: false,
	};

//This creates the connection pool...	
exports.doPoolConnect = function (callback) {
	//only create connection once...
	if (connection_pool) { 
		callback(connection_pool);
		return;
	}
	
	connection_pool = new PooledConnection(connectionConfiguration);
	// connection_pool = new PooledConnection({'hosts': ['ec2-184-169-190-57.us-west-1.compute.amazonaws.com:9160'], 'keyspace': 'midstore' });
	
	connection_pool.on('log', function(level, message, obj) {
		//console.log('log event: %s -- %j', level, message);
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