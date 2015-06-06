var fs = require('fs');
var path = require('path');

var __slice = Array.prototype.slice;

module.exports = function pluginLoader(sourcePath) {
	'use strict';

	var plugins = {};

	var args = __slice.call(arguments, 1);

	fs.readdirSync(sourcePath).forEach(function (filename) {
		var name = filename.substr(0, filename.lastIndexOf('.')).toLowerCase();
		if (name !== 'index') {
			plugins[name] = require(path.join(sourcePath, filename)).apply(this, args);
		}
	});

	return plugins;
};
