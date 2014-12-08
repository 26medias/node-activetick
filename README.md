# Activetick for NodeJS #

[Activetick](http://www.activetick.com) provides real-time and historical stock values.

The CSV format is converted into an array of object, and the "YYYYMMDDHHMMSS" dates are converted into JS dates.


## Setup ##

- [Download](http://www.activetick.com/activetick/contents/PersonalServicesDataAPIDownload.aspx) and install the http proxy
- Launch the http proxy: `ActiveTickFeedHttpServer 127.0.0.1 5000 activetick1.activetick.com [apikey] [username] [password]`
- install the nodejs package: `npm install node-activetick`

## Test ##

    var activetick = require('node-activetick');
    var market = new activetick();
    market.open('AAPL').fetch(function(response) {
    	console.log(response);
    });

## Output format ##

The output from fetch()'s callback is an array of object.

	[
		{
			"d": "2015-01-05T15:05:00.000Z",
			"o": 115.68,
			"h": 115.87,
			"l": 115.67,
			"c": 115.761,
			"v": 277740
		},
		{
			"d": "2015-01-05T15:10:00.000Z",
			"o": 115.76,
			"h": 115.8299,
			"l": 115.66,
			"c": 115.671,
			"v": 181276
		},
		{
			"d": "2015-01-05T15:15:00.000Z",
			"o": 115.68,
			"h": 115.69,
			"l": 115.53,
			"c": 115.54,
			"v": 329890
		},
		{
			"d": "2015-01-05T15:20:00.000Z",
			"o": 115.54,
			"h": 115.75,
			"l": 115.52,
			"c": 115.715,
			"v": 267586
		},
		{
			"d": "2015-01-05T15:25:00.000Z",
			"o": 115.71,
			"h": 115.71,
			"l": 115.6,
			"c": 115.69,
			"v": 242454
		}
		...
	]


- **d**:	Javascript Date Object
- **o**:	Open
- **h**:	High
- **l**:	Low
- **c**:	Close
- **v**:	Volume



## Methods ##

### Init ###

Without options:

    var market = new activetick();

With options:

	var market = new activetick({
		host:	'127.0.0.1',
		port:	5000
	});

### Define the symbol ###

	market.open('AAPL');

### Define the date range ###

	market.from(new Date(2014,01,01))
	market.to(new Date())

### Define the type ###

You can get the prices for intraday daily or weekly values.

	market.type('intraday');
	// or
	market.type('daily');
	// or
	market.type('weekly');

If you request intraday data, you can specify the interval between each value, in minutes. Default is 5.

	market.period(5);	// 5 minutes between each value

### Fetch the data ###

	market.fetch(function(response) {
		// response is an array of objects. See "output" for format details.
	});


## Note ##

This is a work in progress.

Real-time data is not yet implemented.

Pull requests are welcomed.


# License: MIT #
Copyright (c) 2014 Julien Loutre, Twenty-Six Medias, Inc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.