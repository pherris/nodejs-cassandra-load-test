var dataGenerator = require('./dataGenerator.js');

module.exports = function (uniqueId) {
	//create once...
	var randomByteArray  = new Buffer(dataGenerator.unpack(dataGenerator.createRandomString(512)));
	console.log("creating once... or not...");
	
	//getter methods for generating the query you want to run
	return {
		getQuery: function () {
			return 'UPDATE device_mids SET ? = ? WHERE KEY = ?';
		},
		getParams: function (uniqueValue) {
			return [dataGenerator.generateDate(), randomByteArray, (uniqueValue + "" + uniqueId)];
		}
	}
};