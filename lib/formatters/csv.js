var _ = require('lodash');

var DEFAULT_DELIMITER = ',';

function filter(delimiter) {
	return delimiter;
}

module.exports = function(program) {
	'use strict';

	function _quote(cell) {
		if (cell.match(program.csv) || cell.match(/\s/gm)) {
			return '"' + cell + '"';
		} else {
			return cell;
		}
	}

	function _escape(cell) {
		cell = cell ? cell.toString() : '';
		cell = _quote(cell.replace(/\"/gm, '""'));
		return cell;
	}

	function _formatCell(cell) {
		if (_.isObject(cell)) {
			return JSON.stringify(cell, null, 2);
		} else {
			return cell;
		}
	}

	function _csvFormatter(obj, header, pageIndex) {
		var output = '';
		var headers = [];

		pageIndex = pageIndex || 0;

		if (program.csv === true) {
			program.csv = DEFAULT_DELIMITER;
		}

		function getCellObject(obj, parentName) {
			var cellObj = {};
			if (_.isObject(obj) && !_.isArray(obj)) {
				_.keys(obj).forEach(function (key) {
					_.extend(cellObj, getCellObject(obj[key], parentName ? parentName + '.' + key : key));
				});
			} else {
				if (headers.indexOf(parentName) === -1) {
					headers.push(parentName);
				}
				cellObj[parentName] = obj;
			}
			return cellObj;
		}

		var rowObjects = [];
		_.each(obj, function (row) {
			rowObjects.push(getCellObject(row));
		});

		if (pageIndex <= 1) {
			output += headers.join(program.csv) + '\n';
		}

		_.each(rowObjects, function (row) {
			var cells = headers.map(function (key) { return _escape(_formatCell(row[key])); });
			output += cells.join(program.csv) + '\n';
		});

		return output;
	};

	program.option('--csv [delimiter]', 'format output as comma separated value', filter);

	program.on('csv', function () {
		program.setFormatter('csv');
	});

	return _csvFormatter;

};
