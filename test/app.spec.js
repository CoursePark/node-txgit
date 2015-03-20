'use strict';

var expect = require('chai').expect;

describe('node-txgit app', function () {
	this.timeout(5000);
	
	describe('when running tests', function () {
		it('should run without error', function () {
			expect(1).to.equal(1);
		});
	});
});
