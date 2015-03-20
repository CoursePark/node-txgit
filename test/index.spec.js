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
		'/': function () {
			it('should respond with success', function () {
				expect(response.status).to.equal(200);
			});
			it('should have information about app running', function () {
				expect(response.text).to.contain('App is running');
				expect(response.text).to.contain('127.0.0.1');
			});
		}
	};
	
	_.each(urls, function (specs, url) {
		describe('when calling ' + url, function () {
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
			
			specs();
		});
	});
});
