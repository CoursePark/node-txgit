'use strict';

var expect = require('chai').expect;
var request = require('supertest');
var _ = require('lodash');
var mockery = require('mockery');

describe('Index', function () {
	var app, error, response;
	
	beforeEach(function () {
		mockery.enable({
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		mockery.registerMock('child_process', {
			exec: function (cmd, callback) {
				callback();
			}
		});
		
		response = undefined;
		app = require('../app/app')();
		
		delete process.env.TRANSIFEX_USERNAME;
		delete process.env.TRANSIFEX_PASSWORD;
		process.env.GIT_REPO_URL = 'https://example.com/repo';
		delete process.env.LOCALE_DIR;
		delete process.env.LOCALE_EXT;
	});
	
	// Urls to call
	var urls = {
		'/invalid/': function () {
			it('should respond with failure', function () {
				expect(response.status).to.equal(404);
				expect(response.body).to.be.empty;
			});
		},
		'/': function (env) {
			it('should respond with success', function () {
				expect(response.status).to.equal(200);
			});
			it('should have information about app running', function () {
				expect(response.text).to.contain('App is running');
				expect(response.text).to.contain('127.0.0.1');
			});
			
			env.specs();
		}
	};
	
	// Possible ENV settings
	var envs = {
		TRANSIFEX_USERNAME: [
			{
				value: '',
				specs: function () {
					it('should complain about missing TRANSIFEX_USERNAME', function () {
						expect(response.text).to.contain('You still need to set the <span class="label label-default">TRANSIFEX_USERNAME</span> ENV variable.');
					});
				}
			},
			{
				value: 'chesleybrown',
				specs: function () {
					it('should say TRANSIFEX_USERNAME is okay and show what it is set to', function () {
						expect(response.text).to.contain('Set to <span class="label label-default">chesleybrown</span>.');
					});
				}
			}
		],
		TRANSIFEX_PASSWORD: [
			{
				value: '',
				specs: function () {
					it('should complain about missing TRANSIFEX_PASSWORD', function () {
						expect(response.text).to.contain('You still need to set the <span class="label label-default">TRANSIFEX_PASSWORD</span> ENV variable.');
					});
				}
			},
			{
				value: 'password',
				specs: function () {
					it('should say TRANSIFEX_PASSWORD is okay and show what it is set to', function () {
						expect(response.text).to.contain('ENV variable is set, but it\'s a secret!');
					});
				}
			}
		],
		GIT_NAME: [
			{
				value: '',
				specs: function () {
					it('should complain about missing GIT_NAME', function () {
						expect(response.text).to.contain('You still need to set the <span class="label label-default">GIT_NAME</span> ENV variable.');
					});
				}
			},
			{
				value: 'chesley_get',
				specs: function () {
					it('should say GIT_NAME is okay and show what it is set to', function () {
						expect(response.text).to.contain('Set to <span class="label label-default">chesley_get</span>.');
					});
				}
			}
		],
		GIT_EMAIL: [
			{
				value: '',
				specs: function () {
					it('should complain about missing GIT_EMAIL', function () {
						expect(response.text).to.contain('You still need to set the <span class="label label-default">GIT_EMAIL</span> ENV variable.');
					});
				}
			},
			{
				value: 'chesley_get@example.com',
				specs: function () {
					it('should say GIT_EMAIL is okay and show what it is set to', function () {
						expect(response.text).to.contain('Set to <span class="label label-default">chesley_get@example.com</span>.');
					});
				}
			}
		],
		LOCALE_DIR: [
			{
				value: '',
				specs: function () {
					it('should complain about missing LOCALE_DIR', function () {
						expect(response.text).to.contain('You still need to set the <span class="label label-default">LOCALE_DIR</span> ENV variable.');
					});
				}
			},
			{
				value: 'locale',
				specs: function () {
					it('should say LOCALE_DIR is okay and show what it is set to', function () {
						expect(response.text).to.contain('Set to <span class="label label-default">locale</span>.');
					});
				}
			}
		],
		LOCALE_EXT: [
			{
				value: '',
				specs: function () {
					it('should complain about missing LOCALE_EXT', function () {
						expect(response.text).to.contain('You still need to set the <span class="label label-default">LOCALE_EXT</span> ENV variable.');
					});
				}
			},
			{
				value: '.l20n',
				specs: function () {
					it('should say LOCALE_EXT is okay and show what it is set to', function () {
						expect(response.text).to.contain('Set to <span class="label label-default">.l20n</span>.');
					});
				}
			}
		]
	};
	
	_.each(envs, function (values, key) {
		_.each(values, function (env) {
			describe('when ' + key + ' is set to ' + env.value, function () {
				beforeEach(function () {
					process.env[key] = env.value;
				});
				
				_.each(urls, function (specs, url) {
					describe('and calling ' + url, function () {
						beforeEach(function (done) {
							request(app)
								.get(url)
								.end(function (err, res) {
									error = err;
									response = res;
									done();
								})
							;
						});
						
						specs(env);
					});
				});
				
				afterEach(function () {
					delete process.env[key];
				});
			});
		});
	});
	
	after(function () {
		mockery.disable();
	});
});
