const express = require('express');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router
  .route('/')
  .get(getSubjects)
  .post(protect, authorize('admin'), createSubject);

router
  .route('/:id')
  .get(getSubject)
  .put(protect, authorize('admin', 'faculty'), updateSubject)
  .delete(protect, authorize('admin'), deleteSubject);

module.exports = router;
