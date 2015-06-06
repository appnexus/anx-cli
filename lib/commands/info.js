var _ = require('lodash');
var util = require('util');
var moment = require('moment');

module.exports = function info(program) {
	'use strict';

	function _getInfo() {
		var info = {};

		info.Version = program.version();
		info.Target = program.session.target || 'not set';
		info['Api Version'] = program.session.apiVersion || 'not set';
		info.Username = program.session.username || 'not set';
		info['Last Login'] = program.session.lastLogin ? moment(program.session.lastLogin).fromNow() : 'never';
		info.Session = program.session.config.path;
		info.Settings = program.config.path;
		info['Error Log'] = program.LOG_PATH;

		return info;
	}

	function _infoCommand() {
		program.render(program.formatter(_getInfo(), []));
	}

	program
		.command('info')
		.description('shows current login information')
		.action(function () {
			_infoCommand();
		});

	program.on('initialized', function () {

		program.handleError = _.wrap(program.handleError, function (handleError, err) {
			var info = _getInfo();
			_.keys(info).forEach(function (key) {
				program.logs.push(util.format('%s: %s', key, info[key]));
			});
			handleError(err);
		});

	});

};
