var assert = require('assert');
var Spinner = require('../lib/spinner.js');

var assert = require('assert');
var Config = require('../lib/config.js');

var options = {

};

describe('Lib/Spinner', function () {
	var spinner;
	var __consoleLog = console.log;

	beforeEach(function () {
		spinner = new Spinner(options);
	});

	afterEach(function () {
		console.log = __consoleLog
	});

	describe('#start', function () {

		it('should start', function () {
			spinner.start();
		});

	});

	// describe('#stop', function () {

	// 	it('', function () {

	// 	});

	// });

	// describe('#setStatus', function () {

	// 	it('', function () {

	// 	});

	// });

});
