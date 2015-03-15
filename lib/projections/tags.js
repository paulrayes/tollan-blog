'use strict';

var Promise = require('promise');

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

	return new Promise(function(resolve, reject) {
		tollan.registerProjection('blog/tagAdded', 'blog/tags/tagAdded', processTagAdded);
		tollan.registerProjection('blog/tagDeleted', 'blog/tags/tagDeleted', processTagDeleted);
		resolve();
	});
};
