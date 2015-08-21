'use strict';

var GenericStore = require('tollan-client/build/GenericStore');

class TagStore extends GenericStore {
	constructor(tollan) {
		super(tollan);
		this.model = 'blog/tags';
	}
	getDisplayed() {
		this.load().done();
		return this.data.filter(tag => {
			return tag.displayed;
		});
	}
	getBySlug(slug) {
		this.load().done();
		return this.data.find(tag => {
			return tag.slug === slug;
		});
	}
}

module.exports = TagStore;
