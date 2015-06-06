var _ = require('lodash');

module.exports = function(program) {
	'use strict';

	var tagsToReplace = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;'
	};

	function replaceTag(tag) {
		return tagsToReplace[tag] || tag;
	}

	function escape(cell) {
		cell = cell ? cell.toString() : '';
		return cell.replace(/[&<>]/g, replaceTag);
	}

	function formatCell(cell) {
		if (_.isObject(cell)) {
			return JSON.stringify(cell, null, 2);
		} else {
			return cell;
		}
	}

	function _htmlFormatter(obj, header, pageIndex) {
		var output = '';
		var headers = [];

		output += '<html><head>';
		output += '<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">';
		output += '<style> td div { max-width: 400px; max-height: 200px; overflow:scroll }  </style>';
		output += '</head><body>';

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

		output += '<table class="table table-striped table-condensed">';
		// if (pageIndex <= 1) {
		output += '<tr><th>' + headers.join('</th><th>') + '</th></tr>';
		// }

		_.each(rowObjects, function (row) {
			var cells = headers.map(function (key) { return escape(formatCell(row[key])); });
			output += '<tr><td><div>' + cells.join('</div></td><td><div>') + '</div></td></tr>';
		});
		output += '</table>';
		output += '</body></html>';
		return output;
	};

	program.option('--html', 'format output as html');

	program.on('html', function () {
		program.setFormatter('html');
		program.less = false;
	});

	return _htmlFormatter;

};
