var dataGenerator = require('./dataGenerator.js');

module.exports = function (uniqueId) {
	//create once...
	var randomByteArray  = new Buffer(dataGenerator.unpack(dataGenerator.createRandomString(512)));
	
	//getter methods for generating the query you want to run
	return {
		getQuery: function () {
			return 'UPDATE time_series_cf SET ? = ? WHERE KEY = ?';
		},
		getParams: function (uniqueValue) {
			return [dataGenerator.generateDate(), randomByteArray, (uniqueValue + "" + uniqueId)];
		}
	}
};