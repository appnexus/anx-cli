var _ = require('lodash');
var fs = require('fs');

module.exports = function Config(config) {
	'use strict';

	var _self = this;
	var _userConfig;

	_self.path = config.path;
	_self.settings = {};

	try {
		_userConfig = JSON.parse(fs.readFileSync(_self.path, 'utf8') || '{}');
	} catch(err) {
		_userConfig = {};
	}

	_self.settings = _.merge(config.defaults, _userConfig);

	_self.set = function _set(key, value) {
		if (typeof value === 'undefined') {
			delete _userConfig[key];
		} else {
			if (_userConfig[key]) {
				if (_.isPlainObject(_userConfig[key])) {
					_userConfig[key] = _.merge(_userConfig[key], value);
				} else {
					_userConfig[key] = value;
				}
			} else {
				_userConfig[key] = value;
			}
		}
		_self.settings = _.merge(_self.settings, _userConfig);
	};

	_self.get = function _get(key) {
		return _userConfig[key];
	};

	_self.save = function _save() {
		fs.writeFileSync(config.path, JSON.stringify(_userConfig, null, 2));
	};

};
