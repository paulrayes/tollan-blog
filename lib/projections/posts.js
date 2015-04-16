'use strict';

var Promise = require('promise');
var assign = require('object-assign');
var Remarkable = require('remarkable');
var md = new Remarkable('full');

module.exports = function(tollan, redisClient) {
	var log = require('bunyan').createLogger({
		name: 'blog/projections/posts'
	});

	function renderContent(message) {
		if (typeof message.data.content === 'string') {
			var regex = /\n(----*|____*|\*\*\*\**)\n/;
			var hasReadMore = message.data.content.search(regex);
			//console.log(hasReadMore);
			if (hasReadMore === -1) {
				message.data.html = md.render(message.data.content);
				message.data.htmlPreview = message.data.html;
			} else {
				message.data.htmlPreview = md.render(message.data.content.substr(0, hasReadMore));
				message.data.html = md.render(message.data.content.replace(regex, '\n'));
			}
		}
	}
	function setPublishDate(prevPost, message) {
		if (typeof prevPost === 'undefined' || prevPost === null || !prevPost.published) {
			if (message.data.published) {
				message.data.publishDate = message.time/1000;
			}
		}
	}

	function processAdded(message) {
		//console.log(1);
		return new Promise(function(resolve, reject) {
			//console.log(2);
			renderContent(message);
			setPublishDate(null, message);
			redisClient.hset('blog/posts', message.data.slug, JSON.stringify(message.data), function(err) {
				//console.log(3);
				//console.log(err);
				if (err) {
					reject(err);
				} else {
					log.info('Added', message.data.slug);
					resolve();
				}
			});
		});
	}
	function processDeleted(message) {
		return new Promise(function(resolve, reject) {
			redisClient.hdel('blog/posts', message.data.slug, function(err) {
				if (err) {
					reject(err);
				} else {
					//log.info('Deleted', message.data.slug);
					resolve();
				}
			});
		});
	}
	function processEdited(message) {
		return new Promise(function(resolve, reject) {
			// Check if the post exists first so we don't accidently add one
			redisClient.hget('blog/posts', message.data.slug, function(err, post) {
				if (err) {
					reject(err);
				}
				renderContent(message);
				setPublishDate(post, message);
				var newTag = assign({}, JSON.parse(post), message.data);
				//console.log(post);
				//console.log(message.data);
				//console.log(newTag);
				//console.log('---');
				//throw "done";
				redisClient.hset('blog/posts', message.data.slug, JSON.stringify(newTag), function(err) {
					if (err) {
						reject(err);
					} else {
						//log.info('Edited', message.data.slug);
						resolve();
					}
				});
			});

			//redisClient.hdel('blog/posts', message.data.slug);
		});
	}

	return new Promise(function(resolve, reject) {
		tollan.registerProjection('blog/postAdded', 'blog/posts', processAdded);
		tollan.registerProjection('blog/postDeleted', 'blog/posts', processDeleted);
		tollan.registerProjection('blog/postEdited', 'blog/posts', processEdited);
		resolve();
	});
};
