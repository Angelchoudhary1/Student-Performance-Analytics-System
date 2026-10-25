const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Prediction = require('../models/Prediction');
const { extractStudentFeatures, executeMLPrediction } = require('../utils/mlBridge');

// @desc    Get all students with search, filters, sorting & pagination
// @route   GET /api/students
// @access  Private (Admin / Faculty)
exports.getStudents = async (req, res, next) => {
  try {
    const {
      search,
      department,
      semester,
      status,
      risk,
      sortBy = 'rollNo',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (semester && semester !== 'all') {
      query.semester = Number(semester);
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (risk === 'at-risk') {
      query.$or = [
        { attendanceRate: { $lt: 75 } },
        { cgpa: { $lt: 6.0 } },
        { backlogs: { $gt: 0 } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalStudents = await Student.countDocuments(query);

    const students = await Student.find(query)
      .populate('department', 'name code')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalStudents / limitNum);

    res.status(200).json({
      success: true,
      count: students.length,
      total: totalStudents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages,
      },
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed student profile with all marks, attendance, and predictions
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('department')
      .populate('user', '-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Fetch marks grouped by semester
    const marks = await Mark.find({ student: student._id })
      .populate('subject', 'code name credits')
      .sort({ semester: 1 });

    // Fetch attendance records
    const attendance = await Attendance.find({ student: student._id })
      .populate('subject', 'code name credits')
      .sort({ semester: 1 });

    // Fetch or generate AI Prediction
    let prediction = await Prediction.findOne({ student: student._id });
    if (!prediction) {
      const features = await extractStudentFeatures(student);
      const predResult = await executeMLPrediction(features);
      prediction = await Prediction.create({
        student: student._id,
        ...predResult,
      });
    }

    // Calculate academic status cards
    const totalPassed = marks.filter((m) => m.result === 'Pass').length;
    const totalFailed = marks.filter((m) => m.result === 'Fail').length;
    const avgMarks =
      marks.length > 0
        ? Number((marks.reduce((acc, m) => acc + (m.totalMarks || 0), 0) / marks.length).toFixed(2))
        : 0;

    // Semester performance trend
    const semesterTrendMap = {};
    marks.forEach((m) => {
      if (!semesterTrendMap[m.semester]) {
        semesterTrendMap[m.semester] = { semester: m.semester, totalPercentage: 0, count: 0 };
      }
      semesterTrendMap[m.semester].totalPercentage += m.percentage || 0;
      semesterTrendMap[m.semester].count += 1;
    });

    const semesterTrend = Object.values(semesterTrendMap).map((st) => ({
      semester: `Sem ${st.semester}`,
      semNum: st.semester,
      avgPercentage: Number((st.totalPercentage / st.count).toFixed(2)),
    })).sort((a, b) => a.semNum - b.semNum);

    res.status(200).json({
      success: true,
      data: {
        student,
        marks,
        attendance,
        prediction,
        summary: {
          totalSubjects: marks.length,
          passedSubjects: totalPassed,
          failedSubjects: totalFailed,
          averageMarks: avgMarks,
          cgpa: student.cgpa,
          attendanceRate: student.attendanceRate,
          status: student.cgpa >= 7.5 ? 'Excellent' : student.cgpa >= 6.0 ? 'Good' : 'Needs Attention',
        },
        semesterTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin)
exports.createStudent = async (req, res, next) => {
  try {
    const {
      rollNo,
      name,
      email,
      password = 'password123',
      phone,
      department,
      semester = 1,
      section = 'A',
      enrollmentYear = new Date().getFullYear(),
      previousCgpa = 0.0,
      cgpa = 0.0,
      attendanceRate = 100.0,
      skills = [],
      guardian,
      address,
    } = req.body;

    // Check existing rollNo or email
    const existingStudent = await Student.findOne({ rollNo: rollNo.toUpperCase().trim() });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: `Student with Roll Number '${rollNo}' already exists` });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      user = await User.create({
        name,
        email,
        password,
        role: 'student',
      });
    }

    const student = await Student.create({
      rollNo,
      user: user._id,
      name,
      email,
      phone,
      department,
      semester,
      section,
      enrollmentYear,
      previousCgpa,
      cgpa,
      attendanceRate,
      skills: Array.isArray(skills) ? skills : String(skills).split(',').map((s) => s.trim()).filter(Boolean),
      guardian,
      address,
    });

    // Run initial AI prediction for the student
    const features = await extractStudentFeatures(student);
    const predResult = await executeMLPrediction(features);
    await Prediction.create({
      student: student._id,
      ...predResult,
    });

    const populated = await Student.findById(student._id).populate('department');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private (Admin / Faculty)
exports.updateStudent = async (req, res, next) => {
  try {
    if (req.body.skills && typeof req.body.skills === 'string') {
      req.body.skills = req.body.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.user && (req.body.name || req.body.email)) {
      await User.findByIdAndUpdate(student.user, {
        name: student.name,
        email: student.email,
      });
    }

    // Refresh AI prediction after profile update
    const features = await extractStudentFeatures(student);
    const predResult = await executeMLPrediction(features);
    await Prediction.findOneAndUpdate(
      { student: student._id },
      { ...predResult, predictedAt: new Date() },
      { upsert: true }
    );

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student & related records
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }
    await Mark.deleteMany({ student: student._id });
    await Attendance.deleteMany({ student: student._id });
    await Prediction.deleteMany({ student: student._id });
    await student.deleteOne();

    res.status(200).json({ success: true, message: 'Student and all related records deleted successfully' });
  } catch (error) {
    next(error);
  }
};
