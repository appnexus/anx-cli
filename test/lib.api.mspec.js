var assert = require('assert');

var API = require('../lib/api.js');
var api;

describe('Lib/Api', function () {
	beforeEach(function	() {
		api = new API();
	});

	describe('Target', function () {
		it('unset target should fail', function (done) {
			api.get('users').catch(function (result) {
				assert(result[0].message.indexOf('Target not set') >= 0, 'function does not throw Target not set');
				done();
			});
		});
	});

	describe('#get', function () {
		it('should be tested');
	});

	describe('#getJson', function () {
		it('should be tested');
	});

	describe('#post', function () {
		it('should be tested');
	});

	describe('#postJson', function () {
		it('should be tested');
	});

	describe('#put', function () {
		it('should be tested');
	});

	describe('#putJson', function () {
		it('should be tested');
	});

	describe('#deleteJson', function () {
		it('should be tested');
	});

	describe('#getMeta', function () {
		it('should be tested');
	});

	describe('#login', function () {
		it('should be tested');
	});

	describe('#switchToUser', function () {
		it('should be tested');
	});

	describe('#statusOk', function () {
		it('should be tested');
	});

	describe('#hasRecord', function () {
		it('should be tested');
	});

});
