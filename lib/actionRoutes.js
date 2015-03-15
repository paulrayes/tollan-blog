'use strict';

//var saveEvent = require('./eventSaver');
var slugify = require('http-slug');
//var shortId = require('shortid');

module.exports = function(tollan) {
	var router = tollan.express.Router();
	var forms = tollan.newforms;

	router.post('/addTag', function(req, res) {
		// This is coming from the admin section, assume it's validated already
		tollan.saveEvent('blog/tagAdded', {
			slug: slugify(req.body.name),
			name: req.body.name
		}).then(function(index) {
			res.json({status: 'ok'});
		}, function(err) {
			res.status(500).json({});
		});
	});
	router.post('/deleteTag', function(req, res) {
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
