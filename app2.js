var cassandraUtility 	= require('./cassandraUtility.js'),
	insertTracker		= require('./insertTracker.js'),
	dataGenerator		= require('./dataGenerator.js'),
	logger				= require('./logger.js')("info"),
	cluster				= require('cluster'),
	start				= new Date(),
	duration			= 50, //duration to run the test
	numCPUs 			= require('os').cpus().length,
	statisticInterval	= 250,
	statisticsTimer		= null,
	workers				= 0,
	completed			= 0,
	maxWorkers			= 1,
	failureCount		= 0,
	MESSAGE 			= {
							INCREMENTAL: 'incremental',
							SUMMARY:     'summary',
							UPDATE:		 'update'
						  },
	summaryStats		= null,
	statsLogged			= false, //helper variable
	workerStatsSummary	= "";


/**
 * gathers statistics on increment basis
 **/
function gatherIncrementalStats () {
	insertTracker.getIncrementStats(function (stats) {
		process.send({
			type:  		MESSAGE.INCREMENTAL,
			worker: 	process.env,
			details: 	"CurrentWorkers: " + workers + ", TotalCompleted: " + completed + ", AverageTimeForInterval: " + stats.average + ", CountForInterval: " + stats.count
		});
	}); //resets stats and gets current stats
}

/**
 * teardown...
 **/
function cleanup () {
	var end = new Date();
	
	if (statisticsTimer) { clearInterval(statisticsTimer); }
	
	//close pool
	cassandraUtility.doPoolClose();
	
	//send summary statistics to master
	process.send({
		type:  		MESSAGE.SUMMARY,
		worker: 	process.env.NODE_UNIQUE_ID,
		details: 	"\ntest ran for:        " + (end.getTime() - start.getTime() + 
					"\nNumber of Records: " + insertTracker.getTimes() + 
					"\naverage time:      " + insertTracker.getAverageTime()),
		failures:   failureCount,
		successes: 	insertTracker.getTimes()
	});
	
	process.exit();
}
/**
 * this method is always running, until the duration of the test is completed
 **/
function doForDuration () {
	var shuttingDown = false;
	
	//run this for the alloted duration
	var currentTime = new Date();
	if (start.getTime() + duration <= currentTime.getTime()) {
		if (workers <= 0) {
			cleanup();
			return;
		} else {
			shuttingDown = true;
		}
	}
	
	if (workers < maxWorkers && !shuttingDown) {
		workers++;
		completed++;
		
		//do I loop here to get up to maxWorkers, or only spin up one request at a time? for now I think it'll be fast enough to do one at a time...
		cassandraUtility.query('UPDATE device_mids SET ? = ? WHERE DSN = ?',
			params = [dataGenerator.generateDate(), new Buffer(dataGenerator.unpack(dataGenerator.createRandomString(1))),
						dataGenerator.randomNumber(100000)],
			function (error, timeTaken) {
				workers--;
				
				if (error) {
					failureCount++;
				} else {
					//log for my instance
					insertTracker.addTime(timeTaken);
					
					//and for all instances
					process.send({
						'type':  		MESSAGE.UPDATE,
						'timeTaken': 	timeTaken
					});
				}
				
				
		});
	}
	
	process.nextTick(function () { doForDuration(); });

}

/**
 * bootstrap method
 **/
function main () {
	//create the connection pool 
	cassandraUtility.doPoolConnect(function () { logger.debug("connected"); });
	//start running
	doForDuration();
	//start gathering statistics
	statisticsTimer = setInterval(function () { gatherIncrementalStats(); }, statisticInterval);
}
logger.debug("start: \t"+start.getTime());

//go!
if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
		var countWorkers = 0;
		for (var id in cluster.workers) {
	  	    countWorkers++
  	    }
		logger.debug('Thread ' + worker.process.pid + ' terminated');
		logger.debug(countWorkers + " workers left");
		
		if (countWorkers === 0 && !statsLogged) {
			statsLogged = true;
			logger.info("Average Time Across Cluster : " + insertTracker.getAverageTime());
			logger.info("Total Inserts Across Cluster: " + insertTracker.getTimes().length);
			logger.info("Test Ran For (Milliseconds) : " + ((new Date()).getTime() - start.getTime()));
			logger.info("worker stats: " + workerStatsSummary);
		}
    });

	//accept messages from workers.
	Object.keys(cluster.workers).forEach(function(id) {
		cluster.workers[id].on('message', function (msg) { 
			if (msg && msg.type === MESSAGE.INCREMENTAL) {
				logger.info("Thread: " + msg.worker + " : " + msg.details);
			} else if (msg && msg.type === MESSAGE.SUMMARY) {
				//a node just sent it's summary...
				workerStatsSummary += "\nworker finishing, failures: " + msg.failures + ", successes: " + msg.successes.length;
			} else if (msg && msg.type === MESSAGE.UPDATE) {
				insertTracker.addTime(msg.timeTaken);
			} 
		});
	});
} else {
    main();
}	
