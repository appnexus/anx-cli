var _ = require('lodash');
var fs = require('fs');

module.exports = function(program) {
	'use strict';

	program
		.command('get <url>')
		.description('make a GET request to target')
		.action(function(url) {
			program.apiWrapper(_.partial(program.api.getJson, url), function (res, body) {
				if (program.api.hasRecord(body)) {
					if (body.response.count === 1) {
						console.log(program.formatter(body.response[body.response.dbg_info.output_term]));
					} else {
						console.log(program.formatter(body.response[body.response.dbg_info.output_term]));
					}
				} else {
					console.log('GET:'.cyan);
					console.log(program.formatters.json(body));
				}
			});
		});

	program
		.command('post <url> [payload]')
		.description('make a POST request to target')
		.action(function(url, payload) {

			if (program.file) {
				payload = fs.readFileSync(program.file, 'utf8');
			}

			program.apiWrapper(_.partial(program.api.postJson, url, payload), function (res, body) {
				console.log('POST:');
				console.log(program.formatters.json(body));
			});
		});

	program
		.command('put <url> [payload]')
		.description('make a PUT request to target')
		.action(function(url, payload) {

			if (program.file) {
				payload = fs.readFileSync(program.file, 'utf8');
				payload = JSON.parse(fs.readFileSync(program.file, 'utf8'));
			}

			program.apiWrapper(_.partial(program.api.putJson, url, payload), function (res, body) {
				console.log('PUT:');
				console.log(program.formatters.json(body));
			});
		});

	program
		.command('delete <url>')
		.description('make a DELETE request to target')
		.action(function(url) {
			program.apiWrapper(_.partial(program.api.deleteJson, url), function (res, body) {
				console.log('DELETE:');
				console.log(program.formatters.json(body));
			});
		});

};
