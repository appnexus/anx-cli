var _ = require('lodash');
var Promise = require('bluebird');
var packageJson = require('../package.json');

function Api(config) {
	'use strict';

	config = config || {};

	var _self = this;
	_self.userAgent = config.userAgent || 'anx-cli-lib/' + packageJson.version;
	_self.target = config.target || '';
	_self.token = config.token || '';
	_self.request = config.request || require('request');
	_self.dbg_info = null;

	function _processOpts(opts) {
		if (_.isString(opts)) {
			opts = { path: opts };
		} else {
			opts = opts || {};
		}
		return opts;
	}

	function _request(opts, callback) {
		if (callback) {
			return __request(opts, callback);
		} else {
			return new Promise(function (accept, reject) {
				__request(opts, function() {
					if(arguments.length > 0 && arguments[0]) {
						reject(Array.prototype.slice.apply(arguments));
					} else {
						accept(arguments[1]);
					}
				});
			});
		}
	}

	function __request(opts, callback) {
		var baseUrl;
		var params = {};
		var paramString;
		var startTime;
		opts = _processOpts(opts);
		opts.rejectUnauthorized = false;
		opts.headers = {};
		opts.headers['User-Agent'] = _self.userAgent;
		if (!_self.target) {
			return callback(new Error('Target not set'));
		}
		if (_self.token) {
			opts.headers.Authorization = _self.token;
		}
		baseUrl = _self.target.replace(/\/$/, '');
		if (_.isNumber(opts.memberId)) { params.member_id = opts.memberId; }
		if (_.isNumber(opts.startElement)) { params.start_element = opts.startElement; }
		if (_.isNumber(opts.numElements)) { params.num_elements = opts.numElements; }
		if (opts.fields) { params.fields = opts.fields; }
		paramString = _.keys(params).map(function (key) { return key + '=' + params[key]; }).join('&');
		opts.uri = baseUrl + '/' + opts.path.replace(/^\//, '');
		if (paramString !== '') {
			opts.uri += (opts.uri.indexOf('?') === -1) ? '?' : '&';
			opts.uri += paramString;
		}
		startTime = new Date();
		_self.request(opts, function (err, res, body) {
			res = res || {};
			res.requestTime = new Date() - startTime;
			if (body && body.response) {
				_self.dbg_info = body.response.dbg || body.response.dbg_info || {};
				if (body.response.error_id) {
					return callback(new Error(body.response.error), res, body);
				}
			}
			return callback(err, res, body);
		});
	}

	function _get(opts, callback) {
		opts.method = 'GET';
		return _request(opts, callback);
	}

	function _post(opts, callback) {
		opts.method = 'POST';
		return _request(opts, callback);
	}

	function _put(opts, callback) {
		opts.method = 'PUT';
		return _request(opts, callback);
	}

	function _delete(opts, callback) {
		opts.method = 'DELETE';
		return _request(opts, callback);
	}

	function _getJson(opts, callback) {
		opts = _processOpts(opts);
		opts.json = true;
		return _get(opts, callback);
	}

	_self.get = _get;

	_self.getJson = _getJson;

	_self.post = function post(opts, body, callback) {
		opts = _processOpts(opts);
		if (_.isFunction(body)) {
			callback = body;
			body = null;
		}
		opts.body = body;
		return _post(opts, callback);
	};

	_self.postJson = function postJson(opts, body, callback) {
		opts = _processOpts(opts);
		if (_.isFunction(body)) {
			callback = body;
			body = null;
		}
		opts.body = _.isObject(body) ? JSON.stringify(body) : body;
		opts.json = true;
		return _post(opts, callback);
	};

	_self.put = function put(opts, body, callback) {
		opts = _processOpts(opts);
		if (_.isFunction(body)) {
			callback = body;
			body = null;
		}
		opts.body = body;
		return _put(opts, callback);
	};

	_self.putJson = function putJson(opts, body, callback) {
		opts = _processOpts(opts);
		if (_.isFunction(body)) {
			callback = body;
			body = null;
		}
		opts.body = _.isObject(body) ? JSON.stringify(body) : body;
		opts.json = true;
		return _put(opts, callback);
	};

	_self.delete = function del(opts, callback) {
		opts = _processOpts(opts);
		return _delete(opts, callback);
	};

	_self.deleteJson = function deleteJson(opts, callback) {
		opts = _processOpts(opts);
		opts.json = true;
		return _delete(opts, callback);
	};

	_self.getMeta = function getMeta(serviceName, memberId, callback) {
		var opts = {};
		if (!callback) {
			callback = memberId;
			memberId = null;
		}
		opts.memberId = memberId;
		opts.path = '/' + serviceName + '/meta';
		return _self.getJson(opts, callback);
	};

	_self.login = function login(username, password, callback) {
		if (!callback) {
			return _login(username, password);
		}
		_self.token = null;
		_self.postJson('/auth', {
			auth: {
				username: username,
				password: password
			}
		}, function (err, res, body) {
			if (err) {
				return callback(err);
			}
			if (res.statusCode === 200 && Api.prototype.statusOk(body)) {
				_self.token = body.response.token;
				callback(null, _self.token);
			} else {
				callback(new Error(body.response.error));
			}
		});
	};

	function _login(username, password) {
		_self.token = null;
		return new Promise(function (accept, reject) {
			_self.postJson('/auth', {
				auth: {
					username: username,
					password: password
				}
			}).then(function (result) {
				if (result.statusCode === 200 && Api.prototype.statusOk(result.body)) {
					_self.token = result.body.response.token;
					accept(_self.token);
				} else {
					reject(new Error(result.body.response.error));
				}
			}).catch(reject);
		});
	}

	_self.switchToUser = function switchToUser(userId, callback) {
		_self.postJson('/auth', {
			auth: {
				switch_to_user: userId
			}
		}, function (err, res, body) {
			if (err) {
				return callback(err);
			}
			if (res.statusCode === 200 && Api.prototype.statusOk(body)) {
				return callback(null);
			}
			else {
				return callback(new Error(body.response.error));
			}
		});
	};

	return _self;
}

Api.prototype.statusOk = function statusOk(body) {
	return body && body.response && body.response.status === 'OK';
};

Api.prototype.hasRecord = function hasRecord(body) {
	return this.statusOk(body) && body.response.count > 0;
};

Api.prototype.Promise = Promise;

module.exports = Api;
