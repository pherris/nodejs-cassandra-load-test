//creates a random string with length of inputted string.
exports.createRandomString = function (length) {
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
exports.unpack = function (str) {
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

exports.randomNumber = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.generateDate = function () {
	var d = new Date();
	return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDay() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
}