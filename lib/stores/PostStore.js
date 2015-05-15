'use strict';

var EventEmitter = require('eventemitter3');
var assign = require('object-assign');
var Promise = require('promise');

//module.exports = function(tollan) {
	function Store() {
		this.posts = [];
		this.loaded = false;
	}
	Store.prototype.EE = assign({}, EventEmitter.prototype);

	Store.prototype.on = function(event, fn) {
		this.EE.on(event, fn);
	};
	Store.prototype.unload = function() {
		if (this.EE.listeners('change').length === 0) {
			this.posts = [];
			this.loaded = false;
		}
	};
	Store.prototype.removeListener = function(event, fn, once) {
		this.EE.removeListener(event, fn, once);
		if (this.EE.listeners('change').length === 0) {
			setTimeout(this.unload.bind(this), 5000);
		}
	};
	Store.prototype.emit = function(event, a) {
		//console.log(event);
		this.EE.emit(event, a);
	};

	Store.prototype.load = function() {
		if (tollan.SERVER) {
			return;
		}
		tollan.getModel('blog/posts')
			.then(items => {
				//console.log(items);
				this.posts = items;
				this.loaded = Date.now();
				this.emit('change');
			}).catch(err => {
				console.log('blog/PostStore loadError');
				console.log(err);
				this.emit('loadError', err);
			});
	};
	Store.prototype.getAll = function() {
		if (!this.loaded) {
			this.load();
		}
		return this.posts;
	};
	Store.prototype.getPublished = function() {
		if (!this.loaded) {
			this.load();
		}
		var posts = [];
		this.posts.forEach(post => {
			if (post.published) {
				posts.push(post);
			}
		});
		return posts;
	};
	Store.prototype.getPublishedByTag = function(tagSlug) {
		if (!this.loaded) {
			this.load();
		}
		var posts = [];
		this.posts.forEach(post => {
			if (post.published && Array.isArray(post.tags) && post.tags.indexOf(tagSlug) > -1) {
				posts.push(post);
			}
		});
		return posts;
	};
	Store.prototype.getBySlug = function(slug) {
		if (!this.loaded) {
			this.load();
		}
		var foundPost = null;
		this.posts.forEach(post => {
			if (post.published && post.slug === slug) {
				foundPost = post;
			}
		});
		return foundPost;
	};

	module.exports = Store;
//};
