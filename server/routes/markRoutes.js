const express = require('express');
const {
  getMarks,
  getMark,
  createMark,
  updateMark,
  deleteMark,
  bulkUpsertMarks,
} = require('../controllers/markController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getMarks)
  .post(protect, authorize('admin', 'faculty'), createMark);

router.post('/bulk', protect, authorize('admin', 'faculty'), bulkUpsertMarks);

router
  .route('/:id')
  .get(protect, getMark)
  .put(protect, authorize('admin', 'faculty'), updateMark)
  .delete(protect, authorize('admin', 'faculty'), deleteMark);

module.exports = router;
