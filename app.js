var cassandraUtility 	= require('./cassandraUtility.js'),
	insertTracker		= require('./insertTracker.js'),
	logger				= require('./logger.js')("info"),
	dataGenerator		= require('./dataGenerator.js'),
	Query				= require('./myQuery.js'),
	query				= null,
	cluster				= require('cluster'),
	start				= new Date(),
	duration			= 1000 * 60,// * 5, //duration to run the test
	numCPUs 			= require('os').cpus().length,
	statisticInterval	= 1000,
	statisticsTimer		= null,
	workers				= 0,
	completed			= 0,
	maxWorkers			= 100,
	failureCount		= 0,
	myId				= 0,
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
function gatherIncrementalStats (isMaster) {
	insertTracker.getIncrementStats(function (stats) {
		if (isMaster) {
			logger.info("AverageTimeForInterval: " + stats.average + ", CountForInterval: " + stats.count);
		} else {
			process.send({
				type:  		MESSAGE.INCREMENTAL,
				worker: 	process.env,
				details: 	"CurrentWorkers: " + workers + ", TotalCompleted: " + completed + ", AverageTimeForInterval: " + stats.average + ", CountForInterval: " + stats.count
			});
		}
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
		//this for loop takes you right to the max number of concurrent workers
		for (i=0;i<(maxWorkers-workers);i++) {
			workers++;
			completed++;
			// console.log(query.getQuery());
			// console.log(query.getParams());
			cassandraUtility.query(query.getQuery(),
				params = query.getParams(completed), //each core has its own myId and the ts plus the count of completed
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
	}
	
	//process.nextTick was giving me 100% cpu
	//process.nextTick(function () { doForDuration(); });
	setTimeout(function () { doForDuration(); }, 1);

}

/**
 * bootstrap method
 **/
function main () {
	logger.info("myId: " + myId);
	//create the connection pool 
	cassandraUtility.doPoolConnect(function () { logger.debug("connected"); });
	//create this worker's query object
	query = new Query(dataGenerator.randomNumber(100));
	//start running
	doForDuration();
	//start gathering statistics
	statisticsTimer = setInterval(function () { gatherIncrementalStats(); }, statisticInterval);
}
logger.debug("start: \t"+start.getTime());

//go!
if (cluster.isMaster) {
	//get stats incrementally
	statisticsTimer = setInterval(function () { gatherIncrementalStats(true); }, statisticInterval);
	
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
			clearInterval(statisticsTimer);
			console.log("------------------------------------------");
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
				logger.debug("Thread: " + msg.worker + " : " + msg.details);
			} else if (msg && msg.type === MESSAGE.SUMMARY) {
				//a node just sent it's summary...
				workerStatsSummary += "\n\tworker finishing, failures: " + msg.failures + ", successes: " + msg.successes.length;
			} else if (msg && msg.type === MESSAGE.UPDATE) {
				insertTracker.addTime(msg.timeTaken);
			} 
		});
	});
} else {
    main();
}