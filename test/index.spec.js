'use strict';

var expect = require('chai').expect;
var request = require('supertest');
var _ = require('lodash');

describe('Index', function () {
	var app, error, response;
	
	beforeEach(function () {
		response = undefined;
		app = require('../app/app')();
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
		GIT_USERNAME: [
			{
				value: '',
				specs: function () {
					it('should complain about missing GIT_USERNAME', function () {
						expect(response.text).to.contain('You still need to set the <span class="label label-default">GIT_USERNAME</span> ENV variable.');
					});
				}
			},
			{
				value: 'chesleybrown',
				specs: function () {
					it('should say GIT_USERNAME is okay and show what it is set to', function () {
						expect(response.text).to.contain('Set to <span class="label label-default">chesleybrown</span>.');
					});
				}
			}
		],
		GIT_PASSWORD: [
			{
				value: '',
				specs: function () {
					it('should complain about missing GIT_PASSWORD', function () {
						expect(response.text).to.contain('You still need to set the <span class="label label-default">GIT_PASSWORD</span> ENV variable.');
					});
				}
			},
			{
				value: 'password',
				specs: function () {
					it('should say GIT_PASSWORD is okay and show what it is set to', function () {
						expect(response.text).to.contain('ENV variable is set, but it\'s a secret!');
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
});
