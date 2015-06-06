module.exports = function(program) {
	'use strict';

	function _txtFormatter(obj) {
		return JSON.stringify(obj);
	}

	program.option('--txt', 'format output as raw text');

	program.on('txt', function () {
		program.setFormatter('txt');
		program.less = false;
	});

	return _txtFormatter;

};
