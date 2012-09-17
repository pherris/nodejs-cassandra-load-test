var times = new Array();

//adds a time value to the times array
exports.addTime = function (time, callback) {
	times[times.length] = time;
	
	if (callback) callback();
};

//gets the average time taken for all items in array.
exports.getAverageTime = function (callback) {
	var sum = 0;
	
	for (i=0;i<times.length;i++) {
		sum += times[i];
	}

	if (callback) callback(sum/times.length);
};