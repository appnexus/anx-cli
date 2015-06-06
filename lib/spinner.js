var _ = require('lodash');
var util = require('util');

module.exports = function spinner(options) {
	var _spriteIndex = 0;
	var _status = '';
	var _intervalId = null;
	var __consoleLog = null;

	options = options || {};
	_.defaults(options, {
		// sprites: ['   ', '.  '.cyan, '.. '.cyan, '...'.cyan, ' ..'.cyan, '  .'.cyan],
		sprites: ['['.cyan + '='.cyan + '  ]'.grey, '[ '.grey + '='.cyan + ' ]'.grey, '[  '.grey + '='.cyan + ']'.cyan, '[ '.grey + '='.cyan + ' ]'.grey],
		interval: 150
	});

	function _hideCursor() {
		process.stdout.write('\033[?25l');
	}

	function _showCursor() {
		process.stdout.write('\033[?25h');
	}

	function _drawSpinner() {
		process.stdout.write(_status + options.sprites[_spriteIndex]);
	}

	function _clearSpinner() {
		process.stdout.write('\033[' + _status.length + options.sprites[_spriteIndex].length + 'D');
		process.stdout.write(new Array(_status.length + options.sprites[_spriteIndex].length + 1).join(' '));
		process.stdout.write('\033[' + _status.length + options.sprites[_spriteIndex].length + 'D');
	}

	function _startAnimation() {
		_intervalId = _intervalId || setInterval(function() {
			_clearSpinner();
			_spriteIndex = ++_spriteIndex % options.sprites.length;
			_drawSpinner();
		}, options.interval);
	}

	function _isRunning() {
		return _intervalId !== null;
	}

	function _stopAnimation() {
		if (_intervalId) {
			clearInterval(_intervalId);
			_intervalId = null;
		}
	}

	function _wrapLog() {
		_clearSpinner();
		__consoleLog.apply(this, arguments);
	}

	return {
		start: function () {
			if (process.stdout.isTTY) {
				__consoleLog = console.log;
				console.log = _wrapLog;
				_hideCursor();
				_drawSpinner();
				_startAnimation();
			}
		},
		stop: function () {
			if (process.stdout.isTTY && _intervalId) {
				_showCursor();
				_stopAnimation();
				_clearSpinner();
				_spriteIndex = 0;
				console.log = __consoleLog;
			}
		},
		setStatus: function () {
			var wasRunning = _isRunning();
			if (wasRunning) {
				_stopAnimation();
				_clearSpinner();
			}
			_status = util.format.apply(this, arguments);
			if (wasRunning) {
				_startAnimation();
			}
		}
	};
};
