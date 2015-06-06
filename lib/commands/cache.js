var fs = require('fs');
var crypto = require('crypto');
var moment = require('moment');

module.exports = function cache(program) {
	'use strict';

	function _deleteCache() {
		var files = fs.readdirSync(program.CACHE_PATH);
		if (files.length > 0) {
			files.forEach(function (file) {
				var filePath = program.CACHE_PATH + '/' + file;
				program.log('cache delete: ', filePath);
				fs.unlinkSync(filePath);
			});
			program.successMessage('Deleted %s cache file(s)', files.length);
		} else {
			program.successMessage('No cache files to delete');
		}
	}

	function _requestWrapper(request, opts, next) {
		function cacheRequest() {
			request(opts, function cacherReq(err, res, body) {
				if (!err && (body.response && !body.response.error_id)) {
					var reqObject = {
						body: body
					};
					fs.writeFile(cachePath, JSON.stringify(reqObject), 'utf8', function (err) {
						if (!err) { program.log('cache write: %s', cachePath); }
					});
				}
				return next(err, res, body);
			});
		}

		function skipCache() {
			request(opts, next);
		}

		if (program.cache && opts.method === 'GET') {
			var cachePath = program.CACHE_PATH + '/' + crypto.createHash('sha1').update(opts.uri).digest('hex');
			fs.stat(cachePath, function(err, stat) {
				if (!err && moment().diff(stat.ctime, 'seconds') < program.config.settings.cache_max_age) {
					fs.readFile(cachePath, 'utf8', function(err, data) {
						var res;
						if (!err) {
							program.log('cache read: %s', cachePath);
							res = JSON.parse(data);
							return next(null, {}, res.body);
						} else {
							cacheRequest();
						}
					});
				} else {
					cacheRequest();
				}
			});
		} else {
			skipCache();
		}
	}

	program.on('initialized', function () {
		// Initialize and clean cache
		if (program.cache && program.config.settings.cache_max_age > 0) {
			if (!fs.existsSync(program.CACHE_PATH)) { fs.mkdirSync(program.CACHE_PATH); }
			var files = fs.readdirSync(program.CACHE_PATH);
			files.forEach(function (file) {
				var filePath = program.CACHE_PATH + '/' + file;
				if (moment().diff(fs.statSync(filePath).ctime, 'seconds') > program.config.settings.cache_max_age) {
					program.log('delete cache: ', filePath);
					fs.unlinkSync(filePath);
				}
			});
		}

		program
			.command('delete-cache')
			.description('delete cache')
			.action(function () {
				_deleteCache();
			});
	});

	return { requestWrapper: _requestWrapper };
};
