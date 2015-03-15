'use strict';

var Promise = require('promise');

module.exports = {
	getAdminRoutes: function(tollan) {
		return require('./routes')(tollan);
	},
	registerStores: function(tollan) {
		tollan.setStore('blog/tagStore', require('./stores/TagStore')(tollan));
	},
	registerModels: function(tollan, redisClient) {
		tollan.app.use('/api/model/blog', require('./modelRoutes')(tollan, redisClient));
	},
	registerActions: function(tollan) {
		tollan.app.use('/api/action/blog', require('./actionRoutes')(tollan));
	},
	registerProjections: function(tollan, redisClient) {
		return Promise.all([
			require('./projections/tags')(tollan, redisClient)
		]);
	}
};
