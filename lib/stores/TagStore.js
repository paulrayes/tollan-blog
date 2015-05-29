'use strict';

var GenericStore = require('tollan-client/lib/GenericStore');

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
}

module.exports = TagStore;
