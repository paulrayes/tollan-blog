'use strict';

var EventEmitter = require('eventemitter3');
//var assign = require('object-assign');
//var Promise = require('promise');

module.exports = function() {
	function Store(tollan) {
		this.tags = [];
		this.loaded = false;
		this.tollan = tollan;
	}
	Store.prototype.EE = new EventEmitter();//assign({}, EventEmitter.prototype);

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
		//if (tollan.SERVER) {
		//	return;
		//}
		return this.tollan.getModel('blog/tags')
			.then(items => {
				this.tags = items;
				this.loaded = Date.now();
				this.emit('change');
			});/*.catch(err => {
				this.emit('loadError', err);
			});*/
	};
	Store.prototype.getAll = function() {
		if (!this.loaded) {
			this.load().done();
		}
		return this.tags;
	};
	Store.prototype.dehydrate = function() {
		return {
			tags: this.tags,
			loaded: this.loaded
		};
	};
	Store.prototype.rehydrate = function(data) {
		this.tags = data.tags;
		this.loaded = data.loaded;
	};
	Store.prototype.getDisplayed = function() {
		if (!this.loaded) {
			this.load().done();
		}
		var tags = [];
		this.tags.forEach(tag => {
			if (tag.displayed) {
				tags.push(tag);
			}
		});
		return tags;
	};

	//module.exports = Store;
	return Store;
};
