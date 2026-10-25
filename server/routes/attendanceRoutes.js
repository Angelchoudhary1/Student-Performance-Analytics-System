const express = require('express');
const {
  getAttendance,
  getSingleAttendance,
  saveAttendance,
  recordClassSession,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getAttendance)
  .post(protect, authorize('admin', 'faculty'), saveAttendance);

router.post('/session', protect, authorize('admin', 'faculty'), recordClassSession);

router.route('/:id').get(protect, getSingleAttendance);

module.exports = router;
