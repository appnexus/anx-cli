var _ = require('lodash');

module.exports = function (program) {
	'use strict';

	var config = program.config.settings.theme;

	return {
		getColor: function (group, type, value) {
			if (_.typeOf(value) === 'boolean') {
				value = value ? 'true' : 'false';
			}
			value = (value || 'null').toString();
			if (_.has(config[group], type) && program.color) {
				return value[config[group][type]];
			}
			else {
				return value;
			}
		}
	};
};
