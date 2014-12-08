var moment 		= require('moment');
var toolset 	= require('toolset');
var _ 			= require('underscore');

/*
	var market = new activetick();
	
	market
		.open('AAPL')
		.range(from, to)
		.get(index)
		.high
	var indicator = market.execute('bollingers', {
		period:	
		std:	2
	});
	indicator.get(index).property;
*/

var activetick = function(options) {
	
	// Options
	this.options = _.extend({
		host:	'127.0.0.1',
		port:	5000
	}, options);
	
	// Query
	this.query = {
		symbol:	'AAPL',
		range:	{
			from:	moment(new Date()).subtract(7, 'days'),
			to:		new Date()
		},
		type:		0,
		period:		5
	};
	
	return this;
}
// Symbol to fetch
activetick.prototype.open 			= function(symbol) {
	this.query.symbol = symbol;
	return this;
}
// Range: From
activetick.prototype.from 			= function(date) {
	this.query.range.from = date;
	return this;
}
// Range: To
activetick.prototype.to 			= function(date) {
	this.query.range.to = date;
	return this;
}
// Type: Intraday, day, week
activetick.prototype.type 			= function(type) {
	switch (type) {
		case 0:
		case "i":
		case "intra":
		case "intraday":
			this.query.type = 0;
		break;
		case 1:
		case "d":
		case "day":
		case "daily":
			this.query.type = 1;
		break;
		case 2:
		case "w":
		case "week":
		case "weekly":
			this.query.type = 2;
		break;
		default:
			toolset.error('Error: type()', 'Invalid value: '+type+'. Options: intraday, day, week.');
		break;
	}
	return this;
}
// Period, for intraday only
activetick.prototype.period 		= function(period) {
	this.query.period = period;
	return this;
}
// Period, for intraday only
activetick.prototype.baseurl 		= function(period) {
	return 'http://'+this.options.host+':'+this.options.port+'/';
}
activetick.prototype.fetch 			= function(callback) {
	var scope = this;
	
	switch (this.query.type) {
		case 0:
			var url = this.baseurl()+'barData?symbol='+this.query.symbol+'&historyType='+this.query.type+'&intradayMinutes='+this.query.period+'&beginTime='+this.toActiveTickDate(this.query.range.from)+'&endTime='+this.toActiveTickDate(this.query.range.to)+'';
		break;
		default:
			var url = this.baseurl()+'barData?symbol='+this.query.symbol+'&historyType='+this.query.type+'&beginTime='+this.toActiveTickDate(this.query.range.from)+'&endTime='+this.toActiveTickDate(this.query.range.to)+'';
		break;
	}
	
	toolset.file.read(url, function(response) {
		callback(scope.parseResponse(response));
	});
}


// Get the base API url
activetick.prototype.baseurl 		= function(period) {
	return 'http://'+this.options.host+':'+this.options.port+'/';
}
// Convert a date to ActiveTick's format
activetick.prototype.toActiveTickDate 		= function(date) {
	return moment(date).format('YYYYMMDDHHMMSS');
}
// Convert a date to ActiveTick's format
activetick.prototype.fromActiveTickDate 		= function(date) {
	var splits = [4,2,2,2,2,2];
	
	var parts = [];
	
	var cursor = 0;
	_.each(splits, function(index){
		parts.push(date.substr(cursor, index));
		cursor += index;
	});
	
	return new Date(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], 0);
}
// Parse the API response into JSON
activetick.prototype.parseResponse 		= function(raw) {
	var scope = this;
	return _.map(_.compact(raw.split('\r\n')), function(line) {
		var parts = line.split(',');
		return {
			d:		scope.fromActiveTickDate(parts[0]),
			o:		parseFloat(parts[1]),
			h:		parseFloat(parts[2]),
			l:		parseFloat(parts[3]),
			c:		parseFloat(parts[4]),
			v:		parseInt(parts[5])
		};
	});
}


module.exports		= activetick;