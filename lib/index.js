'use strict';

var Promise = require('promise');
var assign = require('object-assign');

module.exports = assign({}, require('./browser'), {
	registerModels: function(tollan, redisClient) {
		tollan.app.use('/api/model/blog', require('./modelRoutes')(tollan, redisClient));
	},
	registerActions: function(tollan) {
		tollan.app.use('/api/action/blog', require('./actionRoutes')(tollan));
	},
	registerProjections: function(tollan, redisClient) {
		return Promise.all([
			require('./projections/posts')(tollan, redisClient),
			require('./projections/tags')(tollan, redisClient)
		]);
	}
});
