'use strict';

module.exports = {
	getAdminRoutes: function(tollan) {
		return require('./routes')(tollan);
	},
	registerStores: function(tollan) {
		tollan.setStore('blog/tagStore', require('./stores/TagStore')(tollan));
	}
};
