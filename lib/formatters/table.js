var _ = require('lodash');
var Table = require('../table');
var inflection = require('inflection');

module.exports = function(program) {
	'use strict';

	function _table(obj, header, pageIndex, compareColumn) {
		var keys;
		var table;

		if (compareColumn && _.isArray(obj) && obj.length > 0) {
			header = header || ['Key'].concat(_.map(obj, function(record) { return record.id; }));
		} else if (_.isPlainObject(obj)) {
			header = header || ['Key', 'Value'];
		} else if (_.isArray(obj)) {
			keys = _.keys(obj[0]);
			header = header || keys.map(function (key) {
				return inflection.titleize(key);
			});
		} else {
			throw new Error('obj must be and object or array');
		}

		table = new Table({
			head: header
		});

		if (compareColumn && _.isArray(obj) && obj.length > 0) {
			_.keys(obj[0]).forEach(function (key) {
				var row = [];
				row.push(key);
				_.each(obj, function (record) {
					var value = record[key];
					if (!_.isNull(value)) {
						if (_.isObject(value)) {
							row.push(program.formatters.json(value));
						} else {
							row.push(program.theme.getColor('columns', key, value.toString()));
						}
					} else {
						row.push(program.theme.getColor('types', 'null', 'null'));
					}
				});
				table.push(row);
			});
		} else if (_.isPlainObject(obj)) {
			_.keys(obj).forEach(function (key) {
				var row = {};
				var value = obj[key];
				if (_.isObject(value)) {
					row[key] = program.formatters.json(value);
				}
				else {
					var type = _.typeOf(value);
					row[key] = program.theme.getColor('types', type, value);
				}

				table.push(row);
			});
		} else {
			_.each(obj, function (record) {
				var row = [];
				keys.forEach(function (key) {
					var value = record[key];

					if (!_.isNull(value)) {
						if (_.isObject(value)) {
							row.push(program.formatters.json(value));
						} else {
							row.push(program.theme.getColor('columns', key, value.toString()));
						}
					} else {
						row.push(program.theme.getColor('types', 'null', 'null'));
					}

				});
				table.push(row);
			});
		}

		return table.toString();

	};

	return _table;
};
