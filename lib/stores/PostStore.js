'use strict';

var EventEmitter = require('eventemitter3');
//var assign = require('object-assign');
//var Promise = require('promise');

module.exports = function() {
	function Store(tollan) {
		this.posts = [];
		this.loaded = false;
		this.tollan = tollan;
	}
	Store.prototype.EE = new EventEmitter();//assign({}, EventEmitter.prototype);

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
		//if (tollan.SERVER) {
		//	return;
		//}
		return this.tollan.getModel('blog/posts')
			.then(items => {
				this.posts = items;
				this.loaded = Date.now();
				this.emit('change');
			});/*.catch(err => {
				console.log('blog/PostStore loadError');
				console.log(err);
				this.emit('loadError', err);
				throw err;
			});*/
	};
	Store.prototype.getAll = function() {
		if (!this.loaded) {
			this.load().done();
		}
		return this.posts;
	};
	Store.prototype.dehydrate = function() {
		return {
			posts: this.posts,
			loaded: this.loaded
		};
	};
	Store.prototype.rehydrate = function(data) {
		this.posts = data.posts;
		this.loaded = data.loaded;
	}
	Store.prototype.getPublished = function() {
		if (!this.loaded) {
			this.load().done();
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
			this.load().done();
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
			this.load().done();
		}
		var foundPost = null;
		this.posts.forEach(post => {
			if (post.published && post.slug === slug) {
				foundPost = post;
			}
		});
		return foundPost;
	};

	//module.exports = Store;
	return Store;
};
