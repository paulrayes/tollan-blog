'use strict';


module.exports = function(tollan, redisClient) {
	var router = tollan.express.Router();

	router.get('/tags', function(req, res) {
		redisClient.hgetall('blog/tags', function(err, items) {
			if (err) {
				return res.status(500).json({});
			}
			var result = [];
			for (var id in items) {
				var tag = JSON.parse(items[id])
				result.push(tag);
			}
			return res.json(result);
		});
	});

	router.get('/posts', function(req, res) {
		redisClient.hgetall('blog/posts', function(err, items) {
			if (err) {
				return res.status(500).json({});
			}
			var result = [];
			for (var id in items) {
				var post = JSON.parse(items[id]);
				result.push(post);
			}
			return res.json(result);
		});
	});

	return router;
};
