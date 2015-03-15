'use strict';

var EventEmitter = require('eventemitter3');
var assign = require('object-assign');
var Promise = require('promise');

module.exports = function(tollan) {
	function TagStore() {
		this.tags = [];
		this.loaded = false;
	}
	TagStore.prototype = assign(TagStore.prototype, EventEmitter.prototype);

	TagStore.prototype.load = function() {
		tollan.getModel('blog/tags')
			.then(items => {
				this.tags = items;
				this.loaded = Date.now();
				this.emit('change');
			}).catch(err => {
				this.emit('loadError', err);
			});
	};
	TagStore.prototype.getAll = function() {
		return this.tags;
	};
	TagStore.prototype.getDisplayed = function() {
		var tags = [];
		this.tags.forEach(tag => {
			if (tag.displayed) {
				tags.push(tag);
			}
		});
		return tags;
	};

	return TagStore;
};
