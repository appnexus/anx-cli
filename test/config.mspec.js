var assert = require('assert');
var Config = require('../lib/config.js');

var options = {
	path: __dirname + '/fixtures/config/base.json'
};

describe('Lib/Config', function () {
	var config;

	beforeEach(function () {
		config = new Config(options);
	});

	describe('#get', function () {
		it('gets value of existing key', function () {
			assert.equal(config.get('setting1'), 'value1');
		});

		it('gets value of non-existing key', function () {
			assert.equal(config.get('not-defined'), undefined);
		});
	});

	describe('#set', function () {
		it('sets value of existing key', function () {
			config.set('setting1', 'value2');
			assert.equal(config.get('setting1'), 'value2');
		});

		it('sets value of non-existing key', function () {
			config.set('setting2', 'some-value');
			assert.equal(config.get('setting2'), 'some-value');
		});

		it('sets value of non-existing key with child objects', function () {
			config.set('setting2', { test: { value: '5'} });
			assert.deepEqual(config.get('setting2'), {"test":{"value":"5"}});
		});
	});

	describe('#save', function () {
		// it('should be tested');
	});

});
