'use strict';

//var saveEvent = require('./eventSaver');
var slugify = require('http-slug');
//var shortId = require('shortid');

module.exports = function(tollan) {
	var router = tollan.express.Router();
	var forms = tollan.newforms;

	router.post('/addTag', function(req, res) {
		// This is coming from the admin section, assume it's validated already if it's present
		if (typeof req.body.slug === 'undefined' || typeof req.body.name === 'undefined') {
			return res.status(400).json({errorText: 'Missing one or more required fields'});
		}
		var data = {
			slug: req.body.slug,
			name: req.body.name
		};
		if (typeof req.body.displayed !== 'undefined') {
			data.displayed = req.body.displayed;
		}
		tollan.saveEvent('blog/tagAdded', data).then(function(index) {
			res.json({status: 'ok'});
		}, function(err) {
			res.status(500).json({});
		});
	});
	router.post('/editTag', function(req, res) {
		if (typeof req.body.slug === 'undefined' || typeof req.body.name === 'undefined') {
			return res.status(400).json({errorText: 'Missing one or more required fields'});
		}
		var data = {
			slug: req.body.slug,
			name: req.body.name
		};
		if (typeof req.body.displayed !== 'undefined') {
			data.displayed = req.body.displayed;
		}
		tollan.saveEvent('blog/tagEdited', data).then(function(index) {
			res.json({status: 'ok'});
		}, function(err) {
			res.status(500).json({});
		});
	});
	router.post('/deleteTag', function(req, res) {
		if (typeof req.body.slug === 'undefined') {
			return res.status(400).json({errorText: 'Missing one or more required fields'});
		}
		tollan.saveEvent('blog/tagDeleted', {
			slug: req.body.slug
		}).then(function(index) {
			res.json({status: 'ok'});
		}, function(err) {
			res.status(500).json({});
		});
	});

	router.all('*', function(req, res, next) {
		res.status(404);
		res.end();
	});

	return router;
};
