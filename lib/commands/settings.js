var _ = require('lodash');

module.exports = function (program) {
	'use strict';

	function _range(min, max) {
		return function (value) {
			if (value < min) {
				throw new Error('value cannot be less than ' + min);
			} else if (value > max) {
				throw new Error('value cannot be more than ' + max);
			}
		};
	}

	var SETTINGS = {
		'cache_max_age': { formatter: parseInt },
		'member_id': { formatter: parseInt },
		'page_size': { formatter: parseInt, validator: _range(0, 100) },
		'editor': {}
	};

	program
		.command('settings [key] [value]')
		.description('list or set user settings')
		.action(function(key, value) {
			if (!key) {
				program.render(program.formatter(_.pick(program.config.settings, _.keys(SETTINGS))));
			} else if (_.keys(SETTINGS).indexOf(key) > -1) {
				if (value && SETTINGS[key].formatter) {
					value = SETTINGS[key].formatter(value);
				}
				if (SETTINGS[key].validator) {
					SETTINGS[key].validator(value);
				}
				program.log('Updating setting: %s = %s', key, value);
				program.config.set(key, value);
				program.config.save();
			} else {
				program.errorMessage('"%s" is not a recognized settings key.', key);
			}
		});

};
