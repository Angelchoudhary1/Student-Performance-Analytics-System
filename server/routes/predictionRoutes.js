const express = require('express');
const {
  predictStudent,
  simulatePrediction,
  batchPredict,
  getAllPredictions,
} = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, getAllPredictions);
router.post('/student/:id', protect, predictStudent);
router.post('/simulate', protect, simulatePrediction);
router.post('/batch', protect, authorize('admin'), batchPredict);

module.exports = router;
