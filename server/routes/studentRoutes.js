const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getStudents)
  .post(protect, authorize('admin'), createStudent);

router
  .route('/:id')
  .get(protect, getStudent)
  .put(protect, authorize('admin', 'faculty'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

module.exports = router;
