'use strict';

//var Promise = require('promise');
//var assign = require('object-assign');

module.exports = {
	/*getAdminRoutes: function(tollan) {
		var React = tollan.React;
		var Router = tollan.Router;
		var Route = Router.Route;
		return [
			<Route name="adminBlogPosts" key="adminBlogPosts" path="blog/posts" handler={require('./components/admin/posts')(tollan)} />,
			<Route name="adminBlogTags" key="adminBlogTags" path="blog/tags" handler={require('./components/admin/tags')(tollan)} />
		];
	},
	registerStores: function() {
		tollan.setStore('blog/postStore', require('./stores/PostStore'));
		tollan.setStore('blog/tagStore', require('./stores/TagStore'));
	},
	registerModels: function(tollan, redisClient) {
		if (!process.browser) {
			tollan.app.use('/api/model/blog', require('./modelRoutes')(tollan, redisClient));
		}
	},
	registerActions: function(tollan) {
		if (!process.browser) {
			tollan.app.use('/api/action/blog', require('./actionRoutes')(tollan));
		}
	},
	registerProjections: function(tollan, redisClient) {
		if (!process.browser) {
			return Promise.all([
				require('./projections/posts')(tollan, redisClient),
				require('./projections/tags')(tollan, redisClient)
			]);
		}
	}*/
	register: function(tollan, redisClient) {
		tollan.setStore('blog/postStore', require('./stores/PostStore'));
		tollan.setStore('blog/tagStore', require('./stores/TagStore'));

		if (!process.browser) {
			tollan.app.use('/api/model/blog', require('./modelRoutes')(tollan, redisClient));
			tollan.app.use('/api/action/blog', require('./actionRoutes')(tollan));

			return Promise.all([
				require('./projections/posts')(tollan, redisClient),
				require('./projections/tags')(tollan, redisClient)
			]);
		}

	}
};
