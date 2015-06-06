module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'*.js',
				'lib/**/*.js',
				'bin/**/*'
			]
		}
	});

	grunt.registerTask('hint', [
		'jshint'
	]);

};
