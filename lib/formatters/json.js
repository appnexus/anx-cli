module.exports = function (program) {
	'use strict';

	function _jsonFormatter(obj) {
		if (obj === undefined) {
			return 'undefined'.yellow;
		}
		var output;
		output = JSON.stringify(obj, null, 2);
		if (program.color) {
			output = output.replace(/(\".*?\":)/g, '$1'.grey);
			output = output.replace(/( true|false)(,|\n)/g, program.theme.getColor('types', 'boolean', '$1') + '$2');
			output = output.replace(/( \d*\.?\d*)(,|\n)/g, program.theme.getColor('types', 'number', '$1') + '$2');
			output = output.replace(/( null)(,|\n)/g, program.theme.getColor('types', 'null', '$1') + '$2');
		}
		return output;
	};

	program.option('--json', 'format output as json');

	program.on('json', function () {
		program.setFormatter('json');
	});

	return _jsonFormatter;
};
