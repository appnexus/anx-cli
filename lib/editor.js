var spawn = require('child_process').spawn;

function _spawner(path, stdio) {
	return function () {
		var proc = spawn(path, Array.prototype.slice.call(arguments, 0), { stdio: stdio });
		proc.stdin.on('error', function (err) {
			if (err.code !== 'EPIPE') { // Hack: ignores epipe error if less closes the pipe prematurely
				throw err;
			}
		});
		proc.write = function (text) {
			proc.stdin.write(text);
			proc.stdin.end();
			return proc;
		};
		return proc;
	};
}

module.exports = {
	editFileWith: function (editorPath, path, callback) {
		var editor = spawn(editorPath, [path], { stdio: 'inherit' });

		editor.on('close', function (code) {
			callback(null, code);
		});
	},
	pipeToLess: function (text, callback) {
		var less = _spawner('less', ['pipe', process.stdout, process.stderr]);

		less('-S', '-R', '-F', '--prompt=press q to quit').write(text).on('close', function	(code, signal) {
			callback(null, code, signal);
		});
	}
};
