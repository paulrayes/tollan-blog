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
				result.push(JSON.parse(items[id]));
			}
			return res.json(result);
		});
	});

	return router;
};
