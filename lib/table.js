var Table = require('cli-table');

module.exports = function (options) {
	'use strict';

	options = options || {};

	return new Table({
		chars: {
			'top': '',
			'top-mid': '',
			'top-left': '',
			'top-right': '',
			'bottom': '',
			'bottom-mid': '',
			'bottom-left': '',
			'bottom-right': '',
			'left': '',
			'left-mid': '',
			'mid': '=',
			'mid-mid': '',
			'right': '',
			'right-mid': '',
			'middle': ''
		},
		head: options.head || [],
		style: {
			compact: true,
			head: ['bold'],
			border: [],
			'padding-left': 0,
			'padding-right': 1
		}
	});
};
