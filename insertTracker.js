var totalTimes = new Array();
var incrementTimes = new Array(); //this one can be reset

//adds a time value to the times array
exports.addTime = function (time, callback) {
	totalTimes[totalTimes.length] = time;
	incrementTimes[incrementTimes.length] = time;
	
	if (callback) callback();
};

//gets the average time taken for all items in array.
exports.getAverageTime = function () {
	return getAverage(totalTimes);
};

exports.getTimes = function () {
	return totalTimes;
}

/**
 * gets the stats for your increment and resets the increment counter.
 **/
exports.getIncrementStats = function (callback) {
	var stats = {
		'average': 	getAverage(incrementTimes),
		'count': 	incrementTimes.length
	};
	incrementTimes = new Array(); //reset
	if (callback) callback(stats);
}

/**
 * gets the average of the array you pass in.
 **/
function getAverage(t) {
	var sum = 0;

	for (i=0;i<t.length;i++) {
		sum += t[i];
	}

	return (sum > 0) ? sum/t.length : 0;
}