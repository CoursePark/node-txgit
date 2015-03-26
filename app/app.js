'use strict';

var bodyParser = require('body-parser');
var dtdToL20nConverter = require('./lib/dtd-to-l20n-converter');
var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var path = require('path');
var q = require('q');
var Transifex = require('transifex');

module.exports = function () {
	var cloned, cloneError, lastAttempt;
	var cloneDir = __dirname + '/clone';
	
	var app = express();
	
	// Parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({extended: false}));
	
	app.use('/media', express.static(__dirname + '/media'));
	app.set('views', path.join(__dirname, '/views'));
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
	var checkout = function () {
		cloneError = false;
		cloned = false;
		
		return clear()
			.then(function () {
				var defer = q.defer();
				
				if (process.env.GIT_REPO_URL) {
					exec('git clone ' + process.env.GIT_REPO_URL + ' ' + cloneDir, function (err) {
						err ? defer.reject(err) : defer.resolve();
					});
				}
				else {
					defer.reject(new Error('Missing required GIT_REPO_URL.'));
				}
				
				return defer.promise;
			})
			.then(function () {
				cloned = true;
			})
			.catch(function (err) {
				console.error(err);
				cloneError = err;
			})
		;
	};
	
	
	// Initial checkout of repo
	checkout().done();
	
	app.get('/', function (req, res) {
		res.render('index', {
			host: req.get('host'),
			TRANSIFEX_USERNAME: process.env.TRANSIFEX_USERNAME,
			TRANSIFEX_FORMAT: process.env.TRANSIFEX_FORMAT,
			TRANSIFEX_PASSWORD: Boolean(process.env.TRANSIFEX_PASSWORD),
			GIT_REPO_URL: process.env.GIT_REPO_URL,
			GIT_NAME: process.env.GIT_NAME,
			GIT_EMAIL: process.env.GIT_EMAIL,
			LOCALE_DIR: process.env.LOCALE_DIR,
			LOCALE_SOURCE: process.env.LOCALE_SOURCE,
			LOCALE_EXT: process.env.LOCALE_EXT,
			cloned: cloned,
			cloneError: cloneError,
			lastAttempt: lastAttempt
		});
	});
	
	app.post('/transifex', function (req, res, next) {
		var errorMsg;
		
		// Do a fresh checkout every time (lazyman reset)
		checkout()
			.then(function () {
				// If body is empty, everything is wrong!
				if (Object.keys(req.body).length === 0) {
					lastAttempt = false;
					errorMsg = 'Invalid body: ' + JSON.stringify(req.body);
					console.error(errorMsg);
					return res.status(400).send(errorMsg);
				}
				
				// Must provide us with all the information we need
				if (!req.body.project || !req.body.resource || !req.body.language) {
					lastAttempt = false;
					errorMsg = 'Required params missing. Must have "project", "resource" and "language". Was given: ' + JSON.stringify(req.body);
					console.error(errorMsg);
					return res.status(400).send(errorMsg);
				}
				
				// Ignore if source language
				if (process.env.LOCALE_SOURCE === req.body.language) {
					lastAttempt = false;
					errorMsg = 'Ignoring source language update: ' + req.body.language;
					console.error(errorMsg);
					return res.status(400).send(errorMsg);
				}
				
				console.log('Valid request received with body: ' + JSON.stringify(req.body));
				
				// TODO: validate transifex signature
				
				// Setup transifex connection
				var transifex = new Transifex({
					project_slug: req.body.project,
					credential: process.env.TRANSIFEX_USERNAME + ':' + process.env.TRANSIFEX_PASSWORD
				});
				
				// Try to get the updated translations
				transifex.translationInstanceMethod(req.body.project, req.body.resource, req.body.language, {mode: 'reviewed'}, function (err, data) {
					if (err) {
						lastAttempt = false;
						return next(err);
					}
					
					// Convert from DTD format to l20n if needed
					if (process.env.TRANSIFEX_FORMAT.toUpperCase() === 'DTD' && process.env.LOCALE_EXT === '.l20n') {
						data = dtdToL20nConverter(data);
					}
					
					var fileName = req.body.language + process.env.LOCALE_EXT;
					var localeFile = path.join(cloneDir, process.env.LOCALE_DIR, fileName);
					fs.writeFile(localeFile, data, function (err) {
						if (err) {
							lastAttempt = false;
							return next(err);
						}
						
						// Commit updated translation file to repo and push it to remote
						exec(
							'cd ' + cloneDir + ' && ' +
							'git config user.name "' + process.env.GIT_NAME + '" && ' +
							'git config user.email "' + process.env.GIT_EMAIL + '" && ' +
							'git add ' + localeFile + ' && ' +
							'git commit -m "Updated ' + fileName + ' by Transifex" && ' +
							'git push ' + process.env.GIT_REPO_URL + ' master',
							function (err) {
								if (err) {
									lastAttempt = false;
									return next(err);
								}
								
								lastAttempt = fileName;
								console.log('Updated ' + fileName + ' at ' + new Date());
								res.status(204).end();
							}
						);
					});
				});
			})
			.done()
		;
	});
	
	// Catch-all error handler
	app.use(function (err, req, res, next) {
		console.error(err);
		res.status(500).send('Internal server error.');
		next();
	});
	
	return app;
};
