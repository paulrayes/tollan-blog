'use strict';

module.exports = {
	getAdminRoutes: function(tollan) {
		var React = tollan.React;
		var Router = tollan.Router;
		var Route = Router.Route;
		return [
			<Route name="adminBlogPosts" key="adminBlogPosts" path="blog/posts" handler={require('./components/admin/posts')(tollan)} />,
			<Route name="adminBlogTags" key="adminBlogTags" path="blog/tags" handler={require('./components/admin/tags')(tollan)} />
		];
	},
	registerStores: function(tollan) {
		tollan.setStore('blog/postStore', require('./stores/PostStore')(tollan));
		tollan.setStore('blog/tagStore', require('./stores/TagStore')(tollan));
	}
};
