var PooledConnection 	= require('cassandra-client').PooledConnection,
	logger			 	= require('./logger.js')("info"),
	con,
	connectionConfiguration = {
		hosts 		: ["127.0.0.1:9160"],
		keyspace 	: "EXAMPLE_KS",
		//user 		: "",
		//pass		: "",
		maxSize 	: 10,
		//idleMillis 	: 100,
		use_bigints	: false,
		//timeout    	: 4000,
		log_time   	: true //Timing is logged to 'node-cassandra-client.driver.timing' route.
	};

//This creates the connection pool...	
exports.doPoolConnect = function (callback) {
	//only create connection once...
	if (con) { callback(con) }
	
	con = new PooledConnection(connectionConfiguration);
	
	if (callback) callback();
};

//this method tries to make a connection, perform an update and close the connection.
//not working right now.
exports.singleConnection = function (cql, params, callback) {
	var start = new Date();
	var Connection = require('cassandra-client').Connection;
	var conn = new Connection({host:'127.0.0.1', port:9160, keyspace:'EXAMPLE_KS'}); //, user:'user', pass:'password'
	conn.connect(function (err) {
		if (err) {
			logger.error(err);
		}
		conn.execute(cql, params, function(err) {
			if (err) {
				logger.error(err);
				// handle error
			} else {
				logger.debug("success");
				// handle success.
			}
			var end = new Date();
			var timeTaken = end.getTime() - start.getTime();
			
			if (callback) callback(timeTaken);
		});
	});
};

//executes CQL statement against the connection pool and returns the time taken to the callback.
exports.insert = function (cql, params, callback) {
	var start = new Date();
				   
	con.execute(cql, params, function (err) {
	    // demonstrates use of a callback.  A simplification would have been:
	    // con.execute(cql, params, callback);
	    if (err) {
			logger.error(err);
	    }
		var end = new Date();
		var timeTaken = end.getTime() - start.getTime();
		
		if (callback) callback(timeTaken);
	});
};

//closes the connection pool...
exports.doPoolClose = function (callback) {
	con.shutdown(function() {
		// no error object by design.
		logger.info("disconnected");
		if (callback) callback();
	});
};