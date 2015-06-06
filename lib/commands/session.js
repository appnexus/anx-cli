module.exports = function (program) {
	'use strict';

	function _login(username, callback) {
		var prompts = [
			{ name: 'username', message: 'Username:', default: username || program.session.username },
			{ name: 'password', message: 'Password:', hidden: true}
		];

		function attemptLogin(max, attempts) {
			attempts = attempts || 1;
			console.log('Login required for: ' + program.session.target.yellow);
			program.prompt.get(prompts, function (err, result) {
				if (err) { return callback(err); }
				program.api.login(result.username, result.password).then(function (token) {
					program.session.token = token;
					program.session.username = result.username;
					program.session.apiVersion = program.api.dbg_info.version;
					program.session.save();
					return callback(null, token);
				}).catch(function () {
					if (attempts < max) {
						if (err && err.message) { program.errorMessage(err.message); }
						return attemptLogin(max, attempts + 1);
					} else {
						return callback(err);
					}
				});
			});
		}

		attemptLogin(3);
	}

	function _requestWrapper(request, opts, next) {
		program.spinner.start();
		request(opts, function (err, res, body) {
			program.spinner.stop();
			if (res && res.statusCode === 401) {
				_login('', function (err, token) {
					if (err) {
						return program.handleError(err);
					}
					if (token) {
						opts.headers.Authorization = token;
						return request(opts, next);
					}
				});
			} else {
				return next(err, res, body);
			}
		});
	}

	function switchToUser(userId, callback) {
		program.api.switchToUser(userId, function (err, token) {
			return callback(err, token);
		});
	}

	program
		.command('login [username]')
		.description('run remote setup commands')
		.action(function(username) {
			_login(username, function (err, token) {
				if (token) {
					program.successMessage('Login successful');
				} else {
					program.errorMessage('Login failed');
				}
			});
	  });

	program
		.command('logout')
		.description('logout by removing session token')
		.action(function() {
			program.api.token = '';
			program.session.token = '';
			program.session.save();
			program.successMessage('Logout successful');
	  });

	program
		.command('switch-user [user_id]')
		.description('switch session user')
		.action(function(userId) {
			switchToUser(userId, function (err, token) {
				if (token) {
					program.successMessage('Switch user successful');
				} else {
					program.errorMessage('Switch user failed');
				}
			});
	  });

	return { login: _login, requestWrapper: _requestWrapper };

};
