var _ = require('lodash');

module.exports = function (program) {
	return {
		logger: function logger(request, opts, next) {
			program.log('%s: %s', opts.method, opts.uri);
			request(opts, next);
		},

		tracer: function tracer(request, opts, next) {
			if (program.trace) {
				console.log('REQUEST: '.cyan + program.formatters.json(opts));
			}
			return request(opts, function (err, res, body) {
				if (err) {
					if (program.trace) {
						program.errorMessage('ERROR: ' + err.message);
					}
					return next(err, res, body);
				}
				else {
					if (program.trace) {
						console.log('RESPONSE: '.cyan + program.formatters.json(res.headers));
						console.log('BODY: '.cyan + program.formatters.json(res.body));
						console.log('');
					}
					if (program.response) {
						console.log('RESPONSE: '.cyan + program.formatters.json(_.pick(res.body.response, 'status', 'count', 'start_element', 'num_elements', 'dbg_info')));
					}
					return next(err, res, body);
				}
			});
		}
	};

};
