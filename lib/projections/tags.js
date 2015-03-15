'use strict';

var Promise = require('promise');
var assign = require('object-assign');

module.exports = function(tollan, redisClient) {
	var log = require('bunyan').createLogger({
		name: 'blog/projections/tags'
	});

	function processTagAdded(message) {
		redisClient.hset('blog/tags', message.data.slug, JSON.stringify(message.data));
		//log.info('Added', message.data.slug);
	}
	function processTagDeleted(message) {
		redisClient.hdel('blog/tags', message.data.slug);
		//log.info('Deleted', message.data.slug);
	}
	function processTagEdited(message) {
		// Check if the tag exists first so we don't accidently add one
		redisClient.hget('blog/tags', message.data.slug, function(err, tag) {
			if (err) {
				throw err;
			}
			var newTag = assign({}, tag, message.data);
			redisClient.hset('blog/tags', message.data.slug, JSON.stringify(newTag));
		});

		redisClient.hdel('blog/tags', message.data.slug);
		//log.info('Edited', message.data.slug);
	}

	return new Promise(function(resolve, reject) {
		tollan.registerProjection('blog/tagAdded', 'blog/tags', processTagAdded);
		tollan.registerProjection('blog/tagDeleted', 'blog/tags', processTagDeleted);
		tollan.registerProjection('blog/tagEdited', 'blog/tags', processTagEdited);
		resolve();
	});
};
