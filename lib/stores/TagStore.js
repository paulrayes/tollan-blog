'use strict';

var EventEmitter = require('eventemitter3');
var assign = require('object-assign');
var Promise = require('promise');

module.exports = function(tollan) {
	function Store() {
		this.tags = [];
		this.loaded = false;
	}
	Store.prototype.EE = assign({}, EventEmitter.prototype);

	Store.prototype.on = function(event, fn, context) {
		this.EE.on(event, fn, context);
	};
	Store.prototype.unload = function() {
		if (this.EE.listeners('change').length === 0) {
			this.tags = [];
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
		this.EE.emit(event, a);
	};

	Store.prototype.load = function() {
		if (tollan.SERVER) {
			return;
		}
		tollan.getModel('blog/tags')
			.then(items => {
				this.tags = items;
				this.loaded = Date.now();
				this.emit('change');
			}).catch(err => {
				this.emit('loadError', err);
			});
	};
	Store.prototype.getAll = function() {
		if (!this.loaded) {
			this.load();
		}
		return this.tags;
	};
	Store.prototype.getDisplayed = function() {
		if (!this.loaded) {
			this.load();
		}
		var tags = [];
		this.tags.forEach(tag => {
			if (tag.displayed) {
				tags.push(tag);
			}
		});
		return tags;
	};

	return Store;
};
