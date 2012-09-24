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
	function doLog(msg, level, callback) {
		if (level>=instanceLevel) {
			console.log(levelMap[level] + " : " + msg);
		}
		if (callback) callback(msg, level);
	}
	
	//public methods for performing logging.
	return {
		debug: function (msg, callback) {
			doLog(msg, 1, callback);
		},
		info: function (msg, callback) {
			doLog(msg, 2, callback);
		},
		warn: function (msg, callback) {
			doLog(msg, 3, callback);
		},
		error: function (msg, callback) {
			doLog(msg, 4, callback);
		},
		fatal: function (msg, callback) {
			doLog(msg, 5, callback);
		}
	}
};