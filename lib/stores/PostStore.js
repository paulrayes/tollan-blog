'use strict';

var GenericStore = require('tollan-client/build/GenericStore');

class PostStore extends GenericStore {
	constructor(tollan) {
		super(tollan);
		this.model = 'blog/posts';
	}
	getPublished() {
		this.load().done();
		return this.data.filter(post => {
			return post.published;
		});
	}
	getPublishedByTag(tagSlug) {
		this.load().done();
		return this.getPublished().filter(post => {
			return Array.isArray(post.tags) && post.tags.indexOf(tagSlug) > -1;
		});
	}
	getBySlug(slug) {
		this.load().done();
		return this.data.find(post => {
			return post.published && post.slug === slug;
		});
	}
}

module.exports = PostStore;
