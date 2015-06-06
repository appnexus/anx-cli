var fs = require('fs');

module.exports = function (program) {

	function _openRenderer(text, contentType) {
		var open = require('open');
		var tmp = require('tmp');

		contentType = (contentType === 'table') ? 'txt' : contentType;
		tmp.tmpName({ mode: 0644, prefix: 'anxcli-' + (program.service || '') + '-', postfix: '.' + (contentType || 'txt') }, function _tempFileCreated(err, path) {
			if (err) {
				throw err;
			}
			program.log('Open: ', path);

			fs.writeFileSync(path, text);
			open(path);
		});
	};

	program.option('--open', 'open output on the local machine');

	program.on('open', function () {
		program.setRenderer('open');
	});

	return _openRenderer;
};
