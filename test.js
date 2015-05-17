var activetick = require('./activetick');
var toolset 	= require('toolset');
var _ 			= require('underscore');
var moment 		= require('moment');

var d = new Date();
var _d = {	 // January 13, 2015
	y:	2015,
	m:	0,
	d:	13
};

// Define the range: One year of data
var range = {
	from:	new Date(_d.y-1, _d.m, _d.d, 0, 0, 0),
	to:		new Date(_d.y, _d.m, _d.d, 23, 0, 0),
};

toolset.info("Date", _d);
toolset.info("Range", range);

// Setup the query
var market = new activetick();
market.open('GOOG');
market.from(range.from);
market.to(range.to);
market.timeframe('1m');

market.fetch(function(response) {
	toolset.log("Response Length", response.length);
	if (response.length > 0) {
		console.log("Response Starts", response[0]);
		console.log("Response Ends", response[response.length-1]);
	}
});

/*
// Old (still working) method.
// Does not support range management. If you ask for too much data, Activetick will reply with some data missing.
var market = new activetick();
market.open('AAPL');		// Symbol
market.from(range.from);	// Date
market.to(range.to);		// Date
market.type('intraday');	// weekly/daily/intraday
market.period(60);	// 1 hour, only for intraday, else skip
market.open('AAPL').fetchCustom(function(response) {
	toolset.log("Response Length", response.length);
	if (response.length > 0) {
		console.log("Response Starts", response[0]);
		console.log("Response Ends", response[response.length-1]);
	}
});
*/


