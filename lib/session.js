var _ = require('lodash');
var fs = require('fs');

module.exports = function (config) {
	var session = {};

	function _loadSession() {
		try {
			session = JSON.parse(fs.readFileSync(config.path, 'utf8') || '{}');
		} catch (err) {
			session = {};
		}
		session.targets = session.targets || {};
		if (session.target && !session.targets[session.target]) {
			session.targets[session.target] = {};
		}
	}

	_loadSession();

	return {
		get username() {
			return session.target && session.targets[session.target].username;
		},
		set username(val) {
			session.targets[session.target].username = val;
		},

		get target() {
			return session.target;
		},
		set target(val) {
			session.target = val;
			session.targets[session.target] = session.targets[session.target] || {};
		},

		get targets() {
			return _.keys(session.targets);
		},

		get token() {
			return session.target && session.targets[session.target].token;
		},
		set token(val) {
			session.targets[session.target].token = val;
			session.targets[session.target].lastLogin = Date.now();
		},

		get apiVersion() {
			return session.target && session.targets[session.target].apiVersion;
		},
		set apiVersion(val) {
			session.targets[session.target].apiVersion = val;
		},

		get lastLogin() {
			return session.target && session.targets[session.target].lastLogin;
		},

		config: config,

		save: function () {
			fs.writeFileSync(config.path, JSON.stringify(session, null, 2));
		}
	};

};
