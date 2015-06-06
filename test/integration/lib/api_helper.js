var _ = require('lodash');
var assert = require('assert');

global.assertSchema = function assertSchema(data, schema, name, options) {
	options = options || {};
	if (_.isArray(schema)) {
		assert(_.isArray(data), 'expected ' + name + ' to be an array but got ' + data);
		data.forEach(function(item, index) {
			assertSchema(item, schema[0], name + '[' + index + ']');
		});
		return;
	} else if (_.isFunction(schema)) {
		schema(data, name);
	} else if (_.isObject(schema)) {
		assert(_.isObject(data), 'expected ' + name + ' to be an object but got ' + data);
		if (options.ignoreUnexpected !== true) {
			_.keys(data).forEach(function(key) {
				// if (!_.has(schema, key)) { console.log("%s: %s,", key, data[key]); }
				assert(_.has(schema, key), 'unexpected key "' + key + '" found on ' + name);
			});
		}
		_.keys(schema).forEach(function(key) {
			assert(_.has(data, key), 'expected ' + name + ' to have the key "' + key + '"');
			return assertSchema(data[key], schema[key], name + '.' + key);
		});
	} else {
		assert.strictEqual(data, schema, 'expected ' + name + ' to equal ' + schema + ' but got ' + data);
	}
}

global.assertResponse = function assertResponse(err, body) {
	assert.equal(err, null);
	assert(_.isEmpty(body.response.error), 'API responded with error: ' + body.response.error);
	assert.equal(body.response.status, 'OK', 'Status was not OK');
}

// Type Checks

isBoolean = function isBoolean(value, name) {
	assert(_.isBoolean(value), 'expected ' + name + ' to be a boolean but got ' + value);
}

global.isString = function isString(value, name) {
	assert(_.isString(value), 'expected ' + name + ' to be a string but got ' + value);
}

global.isNullableString = function isNullableString(value, name) {
	assert(_.isNull(value) || _.isString(value), 'expected ' + name + ' to be a nullable string but got ' + value);
}

global.isNumber = function isInteger(value, name) {
	assert(_.isNumber(value), 'expected ' + name + ' to be a number but got ' + value);
}

global.isInteger = function isInteger(value, name) {
	assert(_.isNumber(value) && value % 1 === 0, 'expected ' + name + ' to be an integer but got ' + value);
}

global.isNullableInteger = function isNullableInteger(value, name) {
	assert(_.isNull(value) || value % 1 === 0, 'expected ' + name + ' to be an nullable integer but got ' + value);
}

global.inList = function inList() {
	var args = Array.prototype.slice.call(arguments, 0);
	return function(value, name) {
		assert(args.indexOf(value) !== -1, 'expected ' + name + ' to be in the list [' + args.join(', ') + '] but got ' + value);
	};
}

global.isDateString = function isDateString(value, name) {
	assert(value.match(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/), 'expected ' + name + ' to be a date string');
}

global.isNullable = function isNullable(schema) {
	return function(value, name) {
		if (!_.isNull(value)) {
			assertSchema(value, schema, name);
		}
	}
}

global.isArray = function isNullable(schema) {
	return function(value, name) {
		assert(_.isArray(value), 'expected ' + name + ' to be an array but got ' + value);
		assertSchema(value, schema, name);
	}
}

global.isArrayWithElements = function isArrayWithElements(schema, length) {
	return function(value, name) {
		assert(_.isArray(value), 'expected ' + name + ' to be an array but got ' + value);
		assert(value.length > 0, 'expected ' + name + ' array to have at least one element');
		if (length > 0) assert.equal(value.length, length, 'expected ' + name + 'array to have ' + length + ' element(s)');
		if (!_.isNull(value)) {
			assertSchema(value, schema, name);
		}
	}
}

global.isObject = function isObject(schema, options) {
	return function(value, name) {
		assert(_.isPlainObject(value), 'expected ' + name + ' to be an object but got ' + value);
		assertSchema(value, schema, name, options);
	}
}
