'use strict';

module.exports = function () {
	var express = require('express');
	var app = express();
	var Git = require('nodegit');
	var fs = require('fs');
	var exec = require('child_process').exec;
	var q = require('q');
	
	var clone, cloneError;
	var cloneDir = __dirname + '/clone';
	
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.enable('trust proxy');
	
	// Use to clear the current cloned repo locally
	var clear = function () {
		var defer = q.defer();
		
		fs.exists(cloneDir, function (exists) {
			if (exists) {
				exec('rm -r ' + cloneDir, function (err) {
					err ? defer.reject(err) : defer.resolve();
				});
			}
			else {
				defer.resolve();
			}
		});
		
		return defer.promise;
	};
	
	/*
	 * This will checkout the repo to the "clone" directory. It uses the
	 * credentials provided in the ENV. First we need to make sure there is no
	 * left over clone, we want to start fresh whenever the server is started.
	 */
	clear()
		.then(function () {
			Git
				.Clone(
					process.env.GIT_REPO_URL,
					cloneDir,
					{
						remoteCallbacks: {
							credentials: function () {
								return Git.Cred.userpassPlaintextNew(process.env.GIT_USERNAME, process.env.GIT_PASSWORD);
							},
							certificateCheck: function () {
								/*
								 * Github will fail cert check on some OSX machines
								 * this overrides that check
								 */
								return 1;
							}
						}
					}
				)
				.then(function (repo) {
					clone = repo;
				})
				.catch(function (err) {
					cloneError = err;
				})
				.done()
			;
		})
	;
	
	app.get('/', function (req, res) {
		res.render('index', {
			host: req.get('host'),
			GIT_USERNAME: process.env.GIT_USERNAME,
			GIT_PASSWORD: Boolean(process.env.GIT_PASSWORD),
			GIT_REPO_URL: process.env.GIT_REPO_URL,
			clone: clone,
			cloneError: cloneError
		});
	});
	
	return app;
};
