var _ = require('lodash');

_.mixin({
	typeOf: function (value) {
		var s = typeof value;
		if (s === 'object') {
			if (value) {
				if (value instanceof Array) {
					s = 'array';
				}
			}
			else {
				s = 'null';
			}
		}
		return s;
	}
});

_.mixin({
  'capitalize': function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
});
