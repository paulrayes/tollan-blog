'use strict';

var Promise = require('promise');
var assign = require('object-assign');

module.exports = function(tollan, redisClient) {
	var log = require('bunyan').createLogger({
		name: 'blog/projections/posts'
	});

	function processAdded(message) {
		redisClient.hset('blog/posts', message.data.slug, JSON.stringify(message.data));
		//log.info('Added', message.data.slug);
	}
	function processDeleted(message) {
		redisClient.hdel('blog/posts', message.data.slug);
		//log.info('Deleted', message.data.slug);
	}
	function processEdited(message) {
		// Check if the post exists first so we don't accidently add one
		redisClient.hget('blog/posts', message.data.slug, function(err, post) {
			if (err) {
				throw err;
			}
			var newTag = assign({}, JSON.parse(post), message.data);
			redisClient.hset('blog/posts', message.data.slug, JSON.stringify(newTag));
		});

		redisClient.hdel('blog/posts', message.data.slug);
		//log.info('Edited', message.data.slug);
	}

	return new Promise(function(resolve, reject) {
		tollan.registerProjection('blog/postAdded', 'blog/posts', processAdded);
		tollan.registerProjection('blog/postDeleted', 'blog/posts', processDeleted);
		tollan.registerProjection('blog/postEdited', 'blog/posts', processEdited);
		resolve();
	});
};
