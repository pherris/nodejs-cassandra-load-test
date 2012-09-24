var PooledConnection 	= require('cassandra-client').PooledConnection,
	logger			 	= require('./logger.js')("info"),
	connection_pool,
	connectionConfiguration = {
		hosts 		: ["127.0.0.1:9160"],
		keyspace 	: "EXAMPLE_KS",
		//user 		: "",
		//pass		: "",
		maxSize 	: 100,
		//idleMillis 	: 100,
		use_bigints	: false,
		//timeout    	: 4000,
		//log_time   	: true //Timing is logged to 'node-cassandra-client.driver.timing' route.
	};

//This creates the connection pool...	
exports.doPoolConnect = function (callback) {
	//only create connection once...

	if (connection_pool) { callback(connection_pool) }
	
	//connection_pool = new PooledConnection(connectionConfiguration);
	connection_pool = new PooledConnection({'hosts': ['127.0.0.1:9160'], 'keyspace': 'EXAMPLE_KS' });
	
	connection_pool.on('log', function(level, message, obj) {
		//console.log('log event: %s -- %j', level, message);
	})
	
	if (callback) callback();
};

//executes CQL statement against the connection pool and returns the time taken to the callback.
exports.query = function (cql, params, callback) {
	var start = new Date();
	
	connection_pool.execute(cql, params, function (err) {
	    // if (err) {
			// logger.error(err);
	    // }
		var end = new Date();
		var timeTaken = end.getTime() - start.getTime();
		
		if (callback) callback(timeTaken);
	});
};

exports.someIO = function (name, contents, callback) {
	var fs = require('fs');
	fs.writeFile("./files/" + name, contents, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	}); 
	if (callback) callback(name);
}

//closes the connection pool...
exports.doPoolClose = function (callback) {
	connection_pool.shutdown(function() {
		// no error object by design.
		logger.info("disconnected");
		if (callback) callback();
	});
};