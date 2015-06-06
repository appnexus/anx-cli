var _ = require('lodash');
var fs = require('fs');
var Api = require('./lib/api');
var util = require('util');
var theme = require('./lib/theme');
var Config = require('./lib/config');
var plugins = require('./lib/plugins');
var request = require('request');
var spinner = require('./lib/spinner');
var session = require('./lib/session');
var program = require('commander');
var configJson = require('./config.json');
var packageJson = require('./package.json');

require('./lib/mixins');

// Program Constants
program.LOG_PATH = process.env.HOME + '/.anx-log';
program.SETTINGS_PATH = process.env.HOME + '/.anxrc';
program.SESSION_PATH = process.env.HOME + '/.anx-session';
program.CACHE_PATH = process.env.HOME + '/.anx-cache';

// Setup logging
program.logs = [];
program.log = (function (debugMode) {
	return function _log() {
		var entry = util.format.apply(this, arguments);
		program.logs.push(entry);
		if (debugMode) {
			console.log('--debug-- ' + entry);
		}
	};
})(process.argv.indexOf('--debug') >= 0);

program.successMessage = function successMessage() {
	var msg = util.format.apply(this, arguments);
	console.log(msg.green);
};

program.errorMessage = function errorMessage() {
	var msg = util.format.apply(this, arguments);
	program.log(msg);
	console.log(msg.red);
};

program.emit = _.wrap(program.emit, function (emit) {
	var args = Array.prototype.slice.call(arguments, 1);
	program.log('[Event: %s]', args[0]);
	emit.apply(program, args);
});

program.parseOptions = _.wrap(program.parseOptions, function (parseOptions, argv) {
	var parsed = parseOptions.call(program, argv);
	program.emit('parsed-options');
	return parsed;
});

// Load Configuration
program.config = new Config({
	path: program.SETTINGS_PATH,
	defaults: configJson
});

program.prompt = require('prompt');
program.prompt.message = '';
program.prompt.delimiter = '';
program.prompt.colors = false;

program.spinner = spinner();
program.theme = theme(program);

program.apiServices = program.config.settings.services;

program
	.version(packageJson.version)
	.usage('<command> [options]')
	.option('-s, --pagesize <pagesize>', 'page size (default 25)', parseInt)
	.option('-i, --pageindex <pageindex>', 'page index (default 0)', parseInt, 0)
	.option('-a, --all', 'return all records')
	.option('-M, --member <id>', 'runs commands a specific member', parseInt)
	.option('-m, --meta', 'get meta data')
	.option('-t, --trace', 'print all http requests')
	.option('-r, --response', 'print api response')
	.option('-f, --file <file>', 'post a file')
	.option('-C, --no-color', 'turn off color')
	.option('-c, --no-cache', 'turn off cache')
	.option('-l, --no-less', 'turn off less for wide tables')
	.option('-d, --debug', 'show debug info');

// Load Plugins
program.cmds = plugins(__dirname + '/lib/commands', program);
program.formatters = plugins(__dirname + '/lib/formatters', program);
program.renderers = plugins(__dirname + '/lib/renderers', program);

program.emit('initialized');

program.log('arguments: ' + process.argv.slice(2).join(' '));

// Default formatter
program.setFormatter = function _setRenderer(name) {
	program.formatterName = name;
	program.formatter = program.formatters[name];
};
program.setFormatter('table') // Default formatter

// Default renderer
program.setRenderer = function _setRenderer(name) {
	program.rendererName = name;
	program.render = program.renderers[name];
}
program.setRenderer('table') // Default renderer

// Load Session
program.session = session({
	path: program.SESSION_PATH
});

var requestWrappers = require('./lib/request-wrappers')(program);

request = _.wrap(request, requestWrappers.tracer);
request = _.wrap(request, program.cmds.session.requestWrapper);
request = _.wrap(request, program.cmds.cache.requestWrapper);
request = _.wrap(request, requestWrappers.logger);

program.api = new Api({
	userAgent: 'ANX-CLI/' + packageJson.version,
	request: request,
	target: program.session.target,
	token: program.session.token
});

program.apiWrapper = function apiWrapper(method, callback) {
	method(function (err, res, body) {
		if (err instanceof Error && err.message === 'Target not set') {
			program.cmds.target.setTarget(null, function (err) {
				if (err) {
					return program.handleError(err);
				} else {
					return program.apiWrapper(method, callback);
				}
			});
		} else if (err) {
			return program.handleError(err);
		} else {
			return callback(res, body);
		}
	});
};

program.wrapWithPaging = function wrapWithPaging(opts, callback, done) {
	var numElements = Math.min(100, program.all ? 100 : program.pagesize || program.config.settings.page_size || (process.stdout.rows - 5));
	_.defaults(opts, {
		startElement: program.pageindex * numElements,
		numElements: numElements
	});
	program.apiWrapper(_.partial(program.api.getJson, opts), function (res, body) {
		opts.numElements = Math.min(opts.numElements, body.response.num_elements);
		opts.recordCount = Math.min(opts.numElements, body.response.count - opts.startElement);
		opts.startElement = opts.startElement + opts.recordCount;
		callback(res, body, function nextPage() {
			if (program.api.hasRecord(body)) {
				if (opts.startElement < body.response.count) {
					return program.wrapWithPaging(opts, callback);
				}
			}
			return done && done();
		});
	});
};

program.wrapWithInteractivePaging = function wrapWithInteractivePaging(opts, callback, done) {
	program.wrapWithPaging(opts, function (res, body/*, nextPage*/) {
		callback(res, body, function _nextPage() {
			if (program.all) {
				if (opts.startElement < body.response.count) {
					program.wrapWithInteractivePaging(opts, callback, done);
				} else {
					if (done) { done(); }
				}
			} else {
				var hackCount = opts.numElements; // TODO: remove this ugly hack
				var message = _.template('[Records ${from} to ${to} of ${total}]', {
					from: (opts.startElement + 1 - hackCount).toString().cyan,
					to: (opts.startElement + opts.recordCount - hackCount).toString().cyan,
					total: (body.response.count || 0).toString().cyan
				});
				console.log('');
				if (process.stdout.isTTY && opts.startElement < body.response.count) {
					program.prompt.get({
						name: 'yesno',
						message: message + ' in ' + ((res.requestTime < 1000) ? res.requestTime + 'ms' : res.requestTime / 1000 + 's') + ' - View More? (Y/n)'
					}, function (err, result) {
						if (err) {
							return err;
						}
						result.yesno = result.yesno || 'Y';
						if (result.yesno.match(/Y|y/)) {
							program.wrapWithInteractivePaging(opts, callback, done);
						} else {
							return done && done();
						}
					});
				} else {
					return done && done();
				}
			}
		});
	}, done);
};

process.on('SIGINT', function() {
	process.exit();
});

process.on('exit', function () {
	program.spinner.stop();
});

program.handleError = function handleError(err) {
	if (err) {
		if (err.code === 'ENOTFOUND') { // {"code":"ENOTFOUND","errno":"ENOTFOUND","syscall":"getaddrinfo"}
			program.errorMessage('Error: Cannot connect to target');
		} else if (err.message) {
			program.errorMessage('Error: ' + err.message);
		} else {
			program.errorMessage('Error: ' + err);
		}
	}

	program.errorMessage('For more information see: ' + program.LOG_PATH);

	fs.writeFileSync(program.LOG_PATH, program.logs.join('\n') + '\n');
};

program.emit('configured');

program.on('parsed-options', function () {
	if (program.trace) { program.cache = false; }
	program.member = program.member || program.config.settings.member_id;

	var colors = require('colors');
	require('colors').mode = !program.open && program.color && process.stdout.isTTY ? colors.mode : 'none';

	program.log('Formatters: ' + _.keys(program.formatters).join(', '));
	program.log('Selected Formatter: %s', program.formatterName);
	program.log('Renderers: ' + _.keys(program.renderers).join(', '));
	program.log('Selected Renderer: %s', program.rendererName);
});

// Process Commands
program.parse(process.argv);

if (!_.isObject(program.args.slice(-1)[0])) {
	if (program.listeners('unknown-command').length > 0) {
		program.emit('unknown-command');
	} else {
		program.help();
	}
}
