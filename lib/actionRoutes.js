'use strict';

//var saveEvent = require('./eventSaver');
var slugify = require('http-slug');
//var shortId = require('shortid');
var assign = require('object-assign');

module.exports = function(tollan) {
	var router = tollan.express.Router();

	router.post('/addTag', function(req, res) {
		// This is coming from the admin section, assume it's validated already if it's present
		if (typeof req.body.slug === 'undefined' || typeof req.body.name === 'undefined') {
			return res.status(400).json({errorText: 'Missing one or more required fields'});
		}
		tollan.saveEvent('blog/tagAdded', req.body).then(function(index) {
			res.json({status: 'ok'});
		}, function(err) {
			res.status(500).json({});
		});
	});
	router.post('/editTag', function(req, res) {
		if (typeof req.body.slug === 'undefined' || typeof req.body.name === 'undefined') {
			return res.status(400).json({errorText: 'Missing one or more required fields'});
		}
		tollan.saveEvent('blog/tagEdited', req.body).then(function(index) {
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

	router.post('/addPost', function(req, res) {
		// This is coming from the admin section, assume it's validated already if it's present
		if (typeof req.body.slug === 'undefined' || typeof req.body.title === 'undefined') {
			return res.status(400).json({errorText: 'Missing one or more required fields'});
		}
		tollan.saveEvent('blog/postAdded', req.body).then(function(index) {
			res.json({status: 'ok'});
		}, function(err) {
			res.status(500).json({});
		});
	});
	router.post('/editPost', function(req, res) {
		if (typeof req.body.slug === 'undefined') {
			return res.status(400).json({errorText: 'Missing one or more required fields'});
		}
		tollan.saveEvent('blog/postEdited', req.body).then(function(index) {
			res.json({status: 'ok'});
		}, function(err) {
			res.status(500).json({});
		});
	});
	router.post('/deletePost', function(req, res) {
		if (typeof req.body.slug === 'undefined') {
			return res.status(400).json({errorText: 'Missing one or more required fields'});
		}
		tollan.saveEvent('blog/postDeleted', {
			slug: req.body.slug
		}).then(function(index) {
			res.json({status: 'ok'});
		}, function(err) {
			res.status(500).json({});
		});
	});

	return router;
};
