'use strict';

module.exports = function(tollan, redisClient) {
	var router = tollan.express.Router();

	router.get('/tags', function(req, res) {
		redisClient.hgetall('blog/tags', function(err, items) {
			if (err) {
				return res.status(500).json({});
			}
			if (items == null) {
				return res.json([]);
			}
			var result = Object.keys(items).map(id => {
				return JSON.parse(items[id]);
			});
			return res.json(result);
		});
	});

	router.get('/posts', function(req, res) {
		redisClient.hgetall('blog/posts', function(err, items) {
			if (err) {
				return res.status(500).json({});
			}
			if (items == null) {
				return res.json([]);
			}

			// List of all fields that exist in each post
			var availableFields = ['content', 'html', 'htmlPreview', 'published', 'publishDate', 'slug', 'title', 'updateDate'];

			// Determine what we want to sort by. We can only sorty by fields that exist.
			var sortBy = 'publishDate';
			if (typeof req.query.fields !== 'undefined' && availableFields.indexOf(req.query.sortBy) > -1) {
				sortBy = req.query.sortBy;
			}
			var order = 'desc';

			// Determine what fields we want to return, default to all of them
			var requestedFields = availableFields;
			if (typeof req.query.fields !== 'undefined') {
				requestedFields = req.query.fields.split(',');
			}

			// Actually generate the response
			// Redis gives us an object of strings. Parse them, filter them, and sort them.
			var result = Object.keys(items).map(id => {
				var item = JSON.parse(items[id]);
				var filteredItem = {};
				requestedFields.forEach(field => {
					if (typeof item[field] !== 'undefined') {
						filteredItem[field] = item[field];
					}
				});
				return filteredItem;
			}).sort(function compare(a,b) {
				if (a[sortBy] < b[sortBy]) {
					return (order === 'desc' ? 1 : -1);
				} else if (a[sortBy] > b[sortBy]) {
					return (order === 'desc' ? -1 : 1);
				} else {
					return 0;
				}
			});

			return res.json(result);
		});
	});

	return router;
};
