//contains configuration for your test.
var config = {
	/**
	 * The duration you wish to run your test for. In milliseconds.
	 **/
	duration:			  		1000 * 60,// * 5, //duration to run the test

	/**
	 * The interval at which you want to report your statistics.
	 **/
	statisticInterval:	  		1000,

	/**
	 * The max number of concurrent connections going against your thread pool.
	 * This limit was added due to the Cassandra connection pool rolling over when 
	 * too many connections were pushed to it.
	 **/
	maxWorkers:			  		100,
	
	/**
	 * Debug level
	 * options are: "debug", "info", "warn", "error", "fatal"
	 **/
	debugLevel:					"debug",
	
	/**
	 * Cassandra configuration object.
	 * key elements are keyspace, hosts and maxSize (max size of pool)
	 * 
	 * taken from: https://code.google.com/a/apache-extras.org/p/cassandra-node/
	 *
	 **/
	cassandraPoolConnection: 	{
		hosts 		: [
						"localhost:9160"
					],
		keyspace 	: "loadstore",
		maxSize 	: 25,
		use_bigints	: false
	}
	
	
};

module.exports = config;