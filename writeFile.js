var fs = require('fs'),
	writeTimes = new Array(),
	logLevel = 2;

exports.writeFile = function (content) {
	var d 					= new Date(), 
	    randomNumber 		= Math.floor(Math.random()*100001),
		fileName 			= d.getTime() + "_" + randomNumber + ".dat",
		filePath 			= __dirname + "/files",
		fullFilePathAndName = filePath + "/" + fileName;
		
	fs.open(fullFilePathAndName, 'w', '0666', function(err, fd) {
		if (err) throw err;
		
		fs.writeFile(fullFilePathAndName, "File Name: " + fileName + "\n\n" + content, function(err) {
			var dDone = new Date(),
				timeTaken = dDone.getTime() - d.getTime();
			if (err) {
				log(5, err);
			} else {
				log(2, "The file was saved!");
			}
			writeTimes[writeTimes.length] = timeTaken;
			log(2, timeTaken);
			getAverageTime();
		}); 
	});
}

getAverageTime = function () {
	var sum = 0;
	for (i=0;i<writeTimes.length;i++) {
		log(1, i + " - " + writeTimes[i]);
		sum += writeTimes[i];
		log(1, sum);
	}
	
	console.log("AVG TIME: " + sum/writeTimes.length);
}

log = function (level, message) {
	if (level>logLevel) {
		console.log(level + " : " + message);
	}
}