var cassandraUtility 	= require('./cassandraUtility.js'),
	insertTracker		= require('./insertTracker.js'),
	async				= require('async'),
	logger				= require('./logger.js')("info"),
	waiting				= 0,
	loopCount			= 0, //internal variable to handle large volumes
	start				= new Date(),
	noRecords			= 500, //no records to insert in a second
	countPerMS 			= noRecords/1000,
	done				= false,
	q = async.queue(function (insertObj, callback) {
		waiting++;
		cassandraUtility.query('UPDATE device_mids SET ? = ? WHERE KEY = ?',
			params = ['2012-01-01', new Buffer(unpack(createRandomString(1))),
						Math.floor((Math.random()*100000)+1)],
			function (timeTaken) {
				waiting--;
				insertTracker.addTime(timeTaken);
				complete();
		});
		callback();
	}, 2);

//create the connection pool 
cassandraUtility.doPoolConnect(function () { logger.info("connected"); });

//writes a lot of records as fast as possible to our sample key space.
function writeRecords(count) {
	count++;
	q.push({'count': count}, function (err) {
		//console.log('finished processing count');
	});
	
	// call again until reaching noRecords with a delay as needed...
	if (count<noRecords) {
		if (countPerMS>1 && count%countPerMS == 0) {
			//take a break
			setTimeout(function () { writeRecords(count); }, 10);
			logger.info("boundry - count : " + count + ", count per ms: " + countPerMS);
		} else {
			//go as fast as you can
			writeRecords(count);
		}
	} else {
		done = true;
		console.log("done = true");
	}
	
}

function writeFiles(count) {
	cassandraUtility.someIO(count, function (fileName) { console.log("saved file: " + fileName); } );
	if (count<noRecords) {
		writeFiles(count + 1);
	}
}

q.drain = function () {
	logger.info("queue is empty!");
};

//once all callbacks have fired, close the connection and log total time.
function complete () {
	if (!done || waiting) {
		logger.debug("still waiting: " + waiting);
		return;
	}
	
	loopCount--;
	
	if (loopCount) { //go again in another batch
		writeRecords(loopCount*noRecords+1);
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
function go () {
	//can we do this one time through, or do we need to split?
	loopCount = Math.ceil(noRecords/10000); //will be one or more - batches of 10k
	writeRecords(0);
}

//creates a random string with length of inputted string.
function createRandomString (length) {
	var stringAr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
		retString = '',
		randomNumber = 0,
		randomFunction = function (randomNumber) { 
			if (randomNumber%2==1) {
				return stringAr[randomNumber];
			} else {
				return stringAr[randomNumber].toUpperCase();
			}
		};
	
	for (i=0;i<length;i++) {
		randomNumber = Math.floor((Math.random()*26));
		retString += randomFunction(randomNumber);
	}
	
	return retString;
}

//string to bytes
function unpack(str) {
    var bytes = [];
    var bytes2 = "";
    for(var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        bytes.push(char >>> 8);
        bytes.push(char & 0xFF);
		bytes2+=(char.toString(16));
    }
	
    return bytes2;
}
go();