const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

// Recalculate overall student attendance percentage helper
const refreshStudentAttendance = async (studentId) => {
  const records = await Attendance.find({ student: studentId });
  if (records.length === 0) return;

  const totalClasses = records.reduce((sum, r) => sum + (r.totalClasses || 0), 0);
  const attendedClasses = records.reduce((sum, r) => sum + (r.attendedClasses || 0), 0);

  const rate = totalClasses > 0 ? Number(((attendedClasses / totalClasses) * 100).toFixed(2)) : 100.0;
  await Student.findByIdAndUpdate(studentId, { attendanceRate: rate });
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { student, subject, semester, status, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (student) query.student = student;
    if (subject) query.subject = subject;
    if (semester && semester !== 'all') query.semester = Number(semester);
    if (status && status !== 'all') query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    let records = await Attendance.find(query)
      .populate({
        path: 'student',
        select: 'name rollNo email department semester section',
        populate: { path: 'department', select: 'name code' },
      })
      .populate({
        path: 'subject',
        select: 'name code credits department semester',
        populate: { path: 'department', select: 'name code' },
      })
      .sort({ semester: -1, percentage: 1 });

    if (search) {
      const s = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.student?.name?.toLowerCase().includes(s) ||
          r.student?.rollNo?.toLowerCase().includes(s) ||
          r.subject?.name?.toLowerCase().includes(s)
      );
    }

    const total = records.length;
    const paginated = records.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
exports.getSingleAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('student', 'name rollNo email department semester')
      .populate('subject', 'name code credits');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update attendance record manually
// @route   POST /api/attendance
// @access  Private (Admin / Faculty)
exports.saveAttendance = async (req, res, next) => {
  try {
    const { student, subject, semester, totalClasses, attendedClasses } = req.body;

    let record = await Attendance.findOne({ student, subject, semester });

    if (record) {
      record.totalClasses = Number(totalClasses);
      record.attendedClasses = Number(attendedClasses);
      await record.save();
    } else {
      record = await Attendance.create({
        student,
        subject,
        semester: Number(semester),
        totalClasses: Number(totalClasses),
        attendedClasses: Number(attendedClasses),
      });
    }

    await refreshStudentAttendance(student);

    const populated = await Attendance.findById(record._id)
      .populate('student', 'name rollNo email')
      .populate('subject', 'name code');

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit daily class session attendance for multiple students
// @route   POST /api/attendance/session
// @access  Private (Admin / Faculty)
exports.recordClassSession = async (req, res, next) => {
  try {
    const { subjectId, semester, date = new Date(), topic = 'Class Lecture', attendances } = req.body;

    if (!attendances || !Array.isArray(attendances)) {
      return res.status(400).json({ success: false, message: 'Invalid attendance session data' });
    }

    const studentIds = [];

    for (const att of attendances) {
      const { studentId, status = 'Present' } = att;
      studentIds.push(studentId);

      const isPresent = status === 'Present' || status === 'Late';

      let doc = await Attendance.findOne({
        student: studentId,
        subject: subjectId,
        semester: Number(semester),
      });

      if (!doc) {
        doc = new Attendance({
          student: studentId,
          subject: subjectId,
          semester: Number(semester),
          totalClasses: 1,
          attendedClasses: isPresent ? 1 : 0,
          records: [{ date, status, topic, markedBy: req.user._id }],
        });
      } else {
        doc.totalClasses += 1;
        if (isPresent) doc.attendedClasses += 1;
        doc.records.push({ date, status, topic, markedBy: req.user._id });
      }

      await doc.save();
    }

    // Refresh overall rates
    for (const sid of [...new Set(studentIds)]) {
      await refreshStudentAttendance(sid);
    }

    res.status(200).json({
      success: true,
      message: `Recorded session attendance for ${attendances.length} students.`,
    });
  } catch (error) {
    next(error);
  }
};
