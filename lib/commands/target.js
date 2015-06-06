var url = require('url');

module.exports = function (program) {
	'use strict';

	function promptList(prompt, options, callback) {
		options.forEach(function(item, index) {
			console.log('%s. %s', (index + 1).toString().bold, item);
		});
		program.prompt.get({
			description: prompt,
			type: 'string',
			pattern: /^\d+$/,
			conform: function(value) {
				if (value === '' || options[value - 1]) {
					return true;
				} else {
					return false;
				}
			}
		}, function(err, result) {
			if (!err) {
				callback(result.question === '' ? '' : options[result.question - 1]);
			}
		});
	}

	function setTarget(targetUrl, callback) {
		if (targetUrl) {
			if (!targetUrl.match(/(http:\/\/|https:\/\/)/)) {
				targetUrl = 'https://' + targetUrl;
			}
			var parsedTarget = url.parse(targetUrl);
			program.session.target = url.format(parsedTarget);
			program.session.save();
			program.api.target = program.session.target;
			program.api.token = program.session.token;
			callback(null, program.session.target);
		} else {
			var options = program.session.target ? [program.session.target] : [];
			var defaults = [];

			program.session.targets.forEach(function (target) {
				if (options.indexOf(target) === -1) {
					options.push(target);
				}
			});

			defaults.push('http://hb.sand-08.adnxs.net/');
			defaults.push('https://api.appnexus.com/');
			defaults.forEach(function (target) {
				if (options.indexOf(target) === -1) {
					options.push(target);
				}
			});

			promptList('Select a target: ', options, function (targetUrl) {
				if (targetUrl !== '') {
					setTarget(targetUrl, callback);
				} else {
					callback('No target set');
				}
			});
		}
	}

	program
		.command('target [url]')
		.description('set target or view current target')
		.action(function(target) {
			setTarget(target, function (err, target) {
				console.log('Target set to: ' + target.yellow);
			});
		});

	program
		.command('targets')
		.description('list known targets')
		.action(function() {
			program.session.targets.forEach(function (target) {
				console.log(target);
			});
		});

	return { setTarget: setTarget };

};
