'use strict';

var EventEmitter = require('eventemitter3');
var assign = require('object-assign');
var Promise = require('promise');

module.exports = function(tollan) {
	function Store() {
		this.posts = [];
		this.loaded = false;
	}
	Store.prototype.EE = assign({}, EventEmitter.prototype);

	Store.prototype.on = function(event, fn, context) {
		this.EE.on(event, fn, context);
	};
	Store.prototype.removeListener = function(event, fn, once) {
		this.EE.removeListener(event, fn, once);
		if (this.EE.listeners('change').length === 0) {
			this.posts = [];
			this.loaded = false;
		}
	};
	Store.prototype.emit = function(event, a) {
		this.EE.emit(event, a);
	};

	Store.prototype.load = function() {
		tollan.getModel('blog/posts')
			.then(items => {
				this.posts = items;
				this.loaded = Date.now();
				this.emit('change');
			}).catch(err => {
				this.emit('loadError', err);
			});
	};
	Store.prototype.getAll = function() {
		return this.posts;
	};
	Store.prototype.getPublished = function() {
		var posts = [];
		this.posts.forEach(post => {
			if (post.published) {
				posts.push(post);
			}
		});
		return posts;
	};

	return Store;
};
