var cassandraUtility 	= require('./cassandraUtility.js'),
	insertTracker		= require('./insertTracker.js'),
	logger				= require('./logger.js')("info"),
	waiting				= 0,
	start				= new Date(),
	noRecords			= 500;

//create the connection pool 
cassandraUtility.doPoolConnect(function () { logger.info("connected"); });

//writes a lot of records as fast as possible to our sample key space.
function writeAShitTonOfRecords() {
	for (i=0;i<noRecords;i++) {
		logger.debug(i);
		waiting++;
		cassandraUtility.insert('UPDATE very_complex_cf SET ?=?, ?=?, ?=? where KEY=?',
						params = ['string_col', 'string_value',
								   'uuid_col', '6f8483b0-65e0-11e0-0000-fe8ebeead9fe',
								   'int_col', i,
								   'complex_insert_row'+i],
						function (timeTaken) {
							waiting--;
							insertTracker.addTime(timeTaken);
							complete();
						});
    }
}

//once all callbacks have fires, close the connection and log total time.
function complete () {
	if (waiting) {
		logger.debug("still waiting: " + waiting);
		return;
	}
	var end = new Date();
	
	cassandraUtility.doPoolClose();
	insertTracker.getAverageTime(function (time) { 
		logger.info("Number of Records: " + noRecords);
		logger.info("average time:      " + time);
		logger.info("total time:        " + (end.getTime() - start.getTime()));
		
	});
}

//go
writeAShitTonOfRecords();