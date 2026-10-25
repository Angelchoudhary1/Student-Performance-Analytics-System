const express = require('express');
const {
  getFaculties,
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getFaculties)
  .post(protect, authorize('admin'), createFaculty);

router
  .route('/:id')
  .get(protect, getFaculty)
  .put(protect, authorize('admin'), updateFaculty)
  .delete(protect, authorize('admin'), deleteFaculty);

module.exports = router;
