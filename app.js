var cassandraUtility 	= require('./cassandraUtility.js'),
	insertTracker		= require('./insertTracker.js'),
	logger				= require('./logger.js')("info"),
	waiting				= 0,
	start				= new Date(),
	noRecords			= 10000;

//create the connection pool 
cassandraUtility.doPoolConnect(function () { logger.info("connected"); });

//writes a lot of records as fast as possible to our sample key space.
function writeRecords(count) {
	waiting++;
	count++;

	cassandraUtility.query('UPDATE very_complex_cf SET ?=?, ?=?, ?=? where KEY=?',
					params = ['string_col', 'string_value',
							   'uuid_col', '6f8483b0-65e0-11e0-0000-fe8ebeead9fe',
							   'int_col', count,
							   'complex_insert_row'+count],
					function (timeTaken) {
						if (count<noRecords ) {
							writeRecords(count);
						}
						waiting--;
						insertTracker.addTime(timeTaken);
						complete();
				});
}

function writeFiles(count) {
	cassandraUtility.someIO(count, function (fileName) { console.log("saved file: " + fileName); } );
	if (count<noRecords) {
		writeFiles(count + 1);
	}
}

//once all callbacks have fired, close the connection and log total time.
function complete () {
	if (waiting) {
		logger.debug("still waiting: " + waiting);
		return;
	}
	var end = new Date();
	
	cassandraUtility.doPoolClose();
	insertTracker.getTimes(function (timesArray) {
		logger.info("Number of Records: " + timesArray.length);	
	});
	insertTracker.getAverageTime(function (time) { 
		logger.info("average time:      " + time);
		logger.info("total time:        " + (end.getTime() - start.getTime()));
		
	});
}

//go
writeRecords(0);
writeFiles(0);