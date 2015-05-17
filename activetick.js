var moment 		= require('moment');
var toolset 	= require('toolset');
var _ 			= require('underscore');
var progressbar = require('progress');
require('date-utils');

var activetick = function(options) {
	
	// Options
	this.options = _.extend({
		host:	'127.0.0.1',
		port:	5000,
		d:		'd',
		h:		'h',
		l:		'l',
		c:		'c',
		o:		'o',
		v:		'v'
	}, options);
	
	// Query
	this.query = {
		symbol:	'AAPL',
		range:	{
			from:	moment(new Date()).subtract(7, 'days'),
			to:		new Date()
		},
		type:		0,
		period:		5,
		timeframe:	'1H'
	};
	
	this.log	= true;	// Logging
	
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
	if (date.getTime() > (new Date()).getTime()) {
		date = new Date();
	}
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
	this.query.period 		= period;
	return this;
}
// Period, for intraday only
activetick.prototype.timeframe 		= function(timeframe) {
	this.query.timeframe 	= timeframe;
	return this;
}
// Period, for intraday only
activetick.prototype.baseurl 		= function(period) {
	return 'http://'+this.options.host+':'+this.options.port+'/';
}
activetick.prototype.fetchCustom 			= function(callback) {
	var scope = this;
	
	toolset.file.read(this.queryUrl(), function(response) {
		callback(scope.parseResponse(response));
	});
}
activetick.prototype.queryUrl 			= function() {
	var scope = this;
	
	switch (this.query.type) {
		case 0:
			var url = this.baseurl()+'barData?symbol='+this.query.symbol+'&historyType='+this.query.type+'&intradayMinutes='+this.query.period+'&beginTime='+this.toActiveTickDate(this.query.range.from)+'&endTime='+this.toActiveTickDate(this.query.range.to)+'';
		break;
		default:
			var url = this.baseurl()+'barData?symbol='+this.query.symbol+'&historyType='+this.query.type+'&beginTime='+this.toActiveTickDate(this.query.range.from)+'&endTime='+this.toActiveTickDate(this.query.range.to)+'';
		break;
	}
	
	return url;
}
activetick.prototype.fetch 		= function(callback) {
	var scope = this;
	
	var timeframe;
	switch (this.query.timeframe.toLowerCase()) {
		case "weekly":
			timeframe = {
				type:	'weekly',
				period:	'',
				limit:	365
			};
		break;
		case "daily":
			timeframe = {
				type:	'daily',
				period:	'',
				limit:	365
			};
		break;
		case "12h":
			timeframe = {
				type:	'intraday',
				period:	60*12,
				limit:	30
			};
		break;
		case "8h":
			timeframe = {
				type:	'intraday',
				period:	60*8,
				limit:	30
			};
		break;
		case "6h":
			timeframe = {
				type:	'intraday',
				period:	60*6,
				limit:	30
			};
		break;
		case "2h":
			timeframe = {
				type:	'intraday',
				period:	60*2,
				limit:	30
			};
		break;
		default:
		case "1h":
			timeframe = {
				type:	'intraday',
				period:	60,
				limit:	30
			};
		break;
		case "30m":
			timeframe = {
				type:	'intraday',
				period:	30,
				limit:	30
			};
		break;
		case "15m":
			timeframe = {
				type:	'intraday',
				period:	15,
				limit:	30
			};
		break;
		case "5m":
			timeframe = {
				type:	'intraday',
				period:	5,
				limit:	30
			};
		break;
		case "1m":
			timeframe = {
				type:	'intraday',
				period:	1,
				limit:	30
			};
		break;
	}
	
	// Calculate how many days are in the range
	var daysInRange = this.query.range.from.getDaysBetween(this.query.range.to);
	toolset.log("daysInRange", daysInRange);
	
	// Calculate the number of batches
	var batchCount = Math.ceil(daysInRange/timeframe.limit);
	toolset.log("batchCount", batchCount);
	
	var ranges		= [];
	if (batchCount > 1) {
		// Split into smaller ranges
		var cursorDate	= new Date(this.query.range.from.getTime());
		var i;
		for (i=0;i<batchCount;i++) {
			if (i==batchCount-1) {
				ranges.push({
					from:	new Date(cursorDate.getTime()),
					to:		this.query.range.to
				});
			} else {
				ranges.push({
					from:	new Date(cursorDate.getTime()),
					to:		new Date(cursorDate.addDays(timeframe.limit))
				});
			}
		}
	} else {
		ranges = [{
			from:	this.query.range.from,
			to:		this.query.range.to
		}];
	}
	//console.log("ranges", ranges);
	
	
	switch (timeframe.type) {
		case "weekly":
			timeframe.typeInt = 2;
		break;
		case "daily":
			timeframe.typeInt = 1;
		break;
		case "intraday":
			timeframe.typeInt = 0;
		break;
	}
	
	var stack = new toolset.stack();
	
	var data = [];
	
	if (this.log) {
		var bar = new progressbar('Downloading the data [:bar] :percent [:current/:total] :etas', {
			complete: 	'=',
			incomplete:	' ',
			width: 		20,
			total: 		ranges.length
		});
	}
	
	_.each(ranges, function(range) {
		stack.add(function(p, cb) {
			switch (timeframe.type) {
				case "intraday":
					var url = scope.baseurl()+'barData?symbol='+scope.query.symbol+'&historyType='+timeframe.typeInt+'&intradayMinutes='+timeframe.period+'&beginTime='+scope.toActiveTickDate(range.from)+'&endTime='+scope.toActiveTickDate(range.to)+'';
				break;
				default:
					var url = this.baseurl()+'barData?symbol='+scope.query.symbol+'&historyType='+timeframe.typeInt+'&beginTime='+scope.toActiveTickDate(range.from)+'&endTime='+scope.toActiveTickDate(range.to)+'';
				break;
			}
			toolset.file.read(url, function(response) {
				if (scope.log) {
					bar.tick();
				}
				data = data.concat(scope.parseResponse(response));
				cb();
			});
			//toolset.info("url", url);
		});
	});
	
	stack.process(function() {
		callback(data);
	}, false);
	/*
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
	});*/
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
	
	return new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5], 0);
}
// Parse the API response into JSON
activetick.prototype.parseResponse 		= function(raw) {
	var scope = this;
	return _.map(_.compact(raw.split('\r\n')), function(line) {
		var parts = line.split(',');
		
		var output = {};
		output[scope.options['d']]= scope.fromActiveTickDate(parts[0]);
		output[scope.options['o']]= parseFloat(parts[1]);
		output[scope.options['h']]= parseFloat(parts[2]);
		output[scope.options['l']]= parseFloat(parts[3]);
		output[scope.options['c']]= parseFloat(parts[4]);
		output[scope.options['v']]= parseInt(parts[5]);
		
		return output;
	});
}


module.exports		= activetick;