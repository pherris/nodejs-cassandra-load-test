module.exports = function (logLevel) {
	var logLevels = {
		DEBUG:	1,
		INFO:	2,
		WARN:	3,
		ERROR:	4,
		FATAL:	5
	}, levelMap = {
		1: "DEBUG",
		2: "INFO",
		3: "WARN",
		4: "ERROR",
		5: "FATAL"
	}, instanceLevel = 1; //default to debug
	
	//if they passed in soemthing valid, use it - otherwise default to debug
	if (logLevels[logLevel.toUpperCase()]) {
		instanceLevel = logLevels[logLevel.toUpperCase()];
	}
	
	//private method to actually do the logging
	function doLog(msg, level) {
		if (level>=instanceLevel) {
			console.log(levelMap[level] + " : " + msg);
		}
	}
	
	//public methods for performing logging.
	return {
		debug: function (msg) {
			doLog(msg, 1);
		},
		info: function (msg) {
			doLog(msg, 2);
		},
		warn: function (msg) {
			doLog(msg, 3);
		},
		error: function (msg) {
			doLog(msg, 4);
		},
		fatal: function (msg) {
			doLog(msg, 5);
		}
	}
};