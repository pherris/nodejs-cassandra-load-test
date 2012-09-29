var PooledConnection 	= require('cassandra-client').PooledConnection,
	Connection 			= require('cassandra-client').Connection,
	logger			 	= require('./logger.js')("info"),
	connection_pool,
	con,
	connectionConfiguration = {
		//hosts 		: ["ec2-184-169-190-57.us-west-1.compute.amazonaws.com:9160"],
		hosts 		: ["localhost:9160"],
		//keyspace 	: "midstore",
		keyspace 	: "midstore_new",
		maxSize 	: 10,
		use_bigints	: false,
	};

exports.doConnect = function (callback) {
	if (connection_pool) {
		logger.error("tried to create a single connection when a pool was already instantiated - please don't do that");
		callback({ error: "can't create single instance, pool already exists" });
		return;
	}
	if (con) {
		callback(con);
		return;
	}
	
	con = new Connection(connectionConfiguration);
	con.connect(function(err) {
		// if err != null, something bad happened. 
		// else, assume all is good.  your connection is ready to use.
		if (!err) {
			// close the connection and return to caller.
			con.close(callback);
		} else {
			// no need to close, just return to caller.
			callback(err);
		}
	});
};

//This creates the connection pool...	
exports.doPoolConnect = function (callback) {
	if (con) {
		logger.error("tried to create a pooled connection when a single was already instantiated - please don't do that");
		callback({ error: "can't create pooled instance, single already exists" });
		return;
	}
	
	//only create connection once...
	if (connection_pool) { 
		callback(connection_pool);
		return;
	}
	
	connection_pool = new PooledConnection(connectionConfiguration);
	// connection_pool = new PooledConnection({'hosts': ['ec2-184-169-190-57.us-west-1.compute.amazonaws.com:9160'], 'keyspace': 'midstore' });
	
	connection_pool.on('log', function(level, message, obj) {
		console.log('log event: %s -- %j', level, message);
	})
	
	if (callback) callback();
};

//executes CQL statement against the connection pool and returns the time taken to the callback.
exports.query = function (cql, params, callback) {
	var start = new Date();
	var error = false;
	var c = (connection_pool) ? connection_pool : con;
	
	c.execute(cql, params, function (err) {
	    if (err) {
			logger.error(err);
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

exports.doClose = function (callback) {
	con.close(callback);
};