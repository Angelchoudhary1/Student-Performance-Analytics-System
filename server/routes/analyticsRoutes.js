const express = require('express');
const {
  getDashboardAnalytics,
  getRankings,
  getAtRiskStudents,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/rankings', protect, getRankings);
router.get('/at-risk', protect, getAtRiskStudents);

module.exports = router;
