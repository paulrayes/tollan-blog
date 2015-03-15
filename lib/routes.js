'use strict';

module.exports = function(tollan) {
	var React = tollan.React;
	var Router = tollan.Router;
	var Route = Router.Route;
	var DefaultRoute = Router.DefaultRoute;
	return (
		<Route name="adminBlogTags" path="blog/tags" handler={require('./components/admin/tags')(tollan)} />
	);
}
