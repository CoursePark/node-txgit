'use strict';

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		tabs4life: {
			options: {
				jshint: {
					mocha: true
				}
			},
			src: [
				'app/**/*.js',
				'Gruntfile.js',
				'LICENSE',
				'README.md',
				'test/**/*.js'
			]
		}
	});
	
	grunt.registerTask('default', ['tabs4life']);
};
