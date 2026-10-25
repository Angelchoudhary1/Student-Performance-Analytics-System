const express = require('express');
const { getDatabaseStats, runAggregationBenchmark } = require('../controllers/dbInsightsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getDatabaseStats);
router.post('/benchmark', protect, authorize('admin'), runAggregationBenchmark);

module.exports = router;
