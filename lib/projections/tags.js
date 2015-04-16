'use strict';

var Promise = require('promise');
var assign = require('object-assign');

module.exports = function(tollan, redisClient) {
	var log = require('bunyan').createLogger({
		name: 'blog/projections/tags'
	});

	function processTagAdded(message) {
		return new Promise(function(resolve, reject) {
			redisClient.hset('blog/tags', message.data.slug, JSON.stringify(message.data));
			//log.info('Added', message.data.slug);
			resolve();
		});
	}
	function processTagDeleted(message) {
		return new Promise(function(resolve, reject) {
			redisClient.hdel('blog/tags', message.data.slug);
			//log.info('Deleted', message.data.slug);
			resolve();
		});
	}
	function processTagEdited(message) {
		return new Promise(function(resolve, reject) {
			// Check if the tag exists first so we don't accidently add one
			redisClient.hget('blog/tags', message.data.slug, function(err, tag) {
				if (err) {
					throw err;
				}
				var newTag = assign({}, JSON.parse(tag), message.data);
				redisClient.hset('blog/tags', message.data.slug, JSON.stringify(newTag));
				resolve();
			});

			redisClient.hdel('blog/tags', message.data.slug);
			//log.info('Edited', message.data.slug);

		});
	}

	return new Promise(function(resolve, reject) {
		tollan.registerProjection('blog/tagAdded', 'blog/tags', processTagAdded);
		tollan.registerProjection('blog/tagDeleted', 'blog/tags', processTagDeleted);
		tollan.registerProjection('blog/tagEdited', 'blog/tags', processTagEdited);
		resolve();
	});
};
