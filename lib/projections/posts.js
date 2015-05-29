'use strict';

var Promise = require('promise');
var assign = require('object-assign');
var Remarkable = require('remarkable');
var md = new Remarkable('full');
var log = require('logule').init(module, 'blog/projections/posts');
module.exports = function(tollan, redisClient) {

	function renderContent(prevPost, message) {
		if (typeof message.data.content !== 'string') {
			return;
		}
		if (prevPost !== null && message.data.content === prevPost.content) {
			return;
		}
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
	function setDates(prevPost, message) {
		message.data.updateDate = Math.round(message.time / 1000);
		if (typeof prevPost === 'undefined' || prevPost === null || !prevPost.published) {
			if (message.data.published) {
				message.data.publishDate = message.data.updateDate;
			}
		}
	}

	function sanitizeMessage(message) {
		var allowedKeys = ['slug', 'title', 'published', 'content'];
		var sanitizedMessage = {};
		Object.keys(message.data).forEach(key => {
			if (allowedKeys.indexOf(key) > -1) {
				sanitizedMessage[key] = message.data[key];
			}
		});
		message.data = sanitizedMessage;
	}

	function processAdded(message) {
		return new Promise(function(resolve, reject) {
			sanitizeMessage(message);
			renderContent(null, message);
			setDates(null, message);
			redisClient.hset('blog/posts', message.data.slug, JSON.stringify(message.data), function(err) {
				if (err) {
					reject(err);
				} else {
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
				post = JSON.parse(post);
				sanitizeMessage(message);
				renderContent(post, message);
				setDates(post, message);
				var newTag = assign({}, post, message.data);
				redisClient.hset('blog/posts', message.data.slug, JSON.stringify(newTag), function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		});
	}

	return new Promise(function(resolve, reject) {
		tollan.registerProjection('blog/postAdded', 'blog/posts', processAdded);
		tollan.registerProjection('blog/postDeleted', 'blog/posts', processDeleted);
		tollan.registerProjection('blog/postEdited', 'blog/posts', processEdited);
		resolve();
	});
};
