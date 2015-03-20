'use strict';

module.exports = function () {
	var express = require('express');
	var app = express();
	
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.enable('trust proxy');
	
	app.get('/', function (req, res) {
		res.render('index', {
			host: req.get('host')
		});
	});
	
	return app;
};
