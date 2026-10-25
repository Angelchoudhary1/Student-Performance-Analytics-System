const mongoose = require('mongoose');
const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const { calculateGradeDetails } = require('../utils/gradeCalculator');

// Recalculate CGPA for student helper
const refreshStudentCGPA = async (studentId) => {
  const marks = await Mark.find({ student: studentId }).populate('subject', 'credits');
  if (marks.length === 0) return;

  let totalCredits = 0;
  let weightedPoints = 0;
  let backlogs = 0;

  marks.forEach((m) => {
    const credits = m.subject?.credits || 3;
    totalCredits += credits;
    weightedPoints += (m.gradePoint || 0) * credits;
    if (m.result === 'Fail') backlogs += 1;
  });

  const cgpa = totalCredits > 0 ? Number((weightedPoints / totalCredits).toFixed(2)) : 0.0;
  await Student.findByIdAndUpdate(studentId, { cgpa, backlogs });
};

// @desc    Get all marks with filters & search
// @route   GET /api/marks
// @access  Private
exports.getMarks = async (req, res, next) => {
  try {
    const { student, subject, semester, result, department, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (student) query.student = student;
    if (subject) query.subject = subject;
    if (semester && semester !== 'all') query.semester = Number(semester);
    if (result && result !== 'all') query.result = result;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    let marks = await Mark.find(query)
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
      .sort({ semester: -1, createdAt: -1 });

    // In-memory search & department filtering if requested
    if (department && department !== 'all') {
      marks = marks.filter(
        (m) =>
          m.student?.department?._id?.toString() === department ||
          m.subject?.department?._id?.toString() === department
      );
    }

    if (search) {
      const s = search.toLowerCase();
      marks = marks.filter(
        (m) =>
          m.student?.name?.toLowerCase().includes(s) ||
          m.student?.rollNo?.toLowerCase().includes(s) ||
          m.subject?.name?.toLowerCase().includes(s) ||
          m.subject?.code?.toLowerCase().includes(s)
      );
    }

    const total = marks.length;
    const paginated = marks.slice(skip, skip + limitNum);

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

// @desc    Get single mark record
// @route   GET /api/marks/:id
// @access  Private
exports.getMark = async (req, res, next) => {
  try {
    const mark = await Mark.findById(req.params.id)
      .populate('student', 'name rollNo email department')
      .populate('subject', 'name code credits');

    if (!mark) {
      return res.status(404).json({ success: false, message: 'Mark record not found' });
    }

    res.status(200).json({ success: true, data: mark });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Add student mark record
// @route   POST /api/marks
// @access  Private (Admin / Faculty)
exports.createMark = async (req, res, next) => {
  try {
    const { student, subject, semester, internalMarks = 0, assignmentMarks = 0, midtermMarks = 0, endtermMarks = 0, remarks } = req.body;

    const existing = await Mark.findOne({ student, subject, semester });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A mark record already exists for this student in this subject and semester. Please edit the existing record.',
      });
    }

    const mark = await Mark.create({
      student,
      subject,
      semester,
      internalMarks: Number(internalMarks),
      assignmentMarks: Number(assignmentMarks),
      midtermMarks: Number(midtermMarks),
      endtermMarks: Number(endtermMarks),
      remarks,
      enteredBy: req.user._id,
    });

    await refreshStudentCGPA(student);

    const populated = await Mark.findById(mark._id)
      .populate('student', 'name rollNo email')
      .populate('subject', 'name code credits');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student mark record
// @route   PUT /api/marks/:id
// @access  Private (Admin / Faculty)
exports.updateMark = async (req, res, next) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) {
      return res.status(404).json({ success: false, message: 'Mark record not found' });
    }

    const { internalMarks, assignmentMarks, midtermMarks, endtermMarks, remarks, semester } = req.body;

    if (internalMarks !== undefined) mark.internalMarks = Number(internalMarks);
    if (assignmentMarks !== undefined) mark.assignmentMarks = Number(assignmentMarks);
    if (midtermMarks !== undefined) mark.midtermMarks = Number(midtermMarks);
    if (endtermMarks !== undefined) mark.endtermMarks = Number(endtermMarks);
    if (remarks !== undefined) mark.remarks = remarks;
    if (semester !== undefined) mark.semester = Number(semester);

    await mark.save();
    await refreshStudentCGPA(mark.student);

    const populated = await Mark.findById(mark._id)
      .populate('student', 'name rollNo email')
      .populate('subject', 'name code credits');

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete mark record
// @route   DELETE /api/marks/:id
// @access  Private (Admin / Faculty)
exports.deleteMark = async (req, res, next) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) {
      return res.status(404).json({ success: false, message: 'Mark record not found' });
    }

    const studentId = mark.student;
    await mark.deleteOne();
    await refreshStudentCGPA(studentId);

    res.status(200).json({ success: true, message: 'Mark record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk Upsert marks for a subject batch (Faculty Grading Sheet)
// @route   POST /api/marks/bulk
// @access  Private (Admin / Faculty)
exports.bulkUpsertMarks = async (req, res, next) => {
  try {
    const { subjectId, semester, entries } = req.body;
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ success: false, message: 'Invalid entries payload' });
    }

    const operations = [];
    const studentIds = [];

    for (const entry of entries) {
      const { studentId, internalMarks = 0, assignmentMarks = 0, midtermMarks = 0, endtermMarks = 0, remarks = '' } = entry;
      const totalMarks = Number((internalMarks + assignmentMarks + midtermMarks + endtermMarks).toFixed(2));
      const { percentage, grade, gradePoint, result } = calculateGradeDetails(totalMarks, 100);

      studentIds.push(studentId);

      operations.push({
        updateOne: {
          filter: { student: studentId, subject: subjectId, semester: Number(semester) },
          update: {
            $set: {
              internalMarks,
              assignmentMarks,
              midtermMarks,
              endtermMarks,
              totalMarks,
              percentage,
              grade,
              gradePoint,
              result,
              remarks,
              enteredBy: req.user._id,
            },
          },
          upsert: true,
        },
      });
    }

    if (operations.length > 0) {
      await Mark.bulkWrite(operations);
      // Refresh CGPAs
      for (const sid of [...new Set(studentIds)]) {
        await refreshStudentCGPA(sid);
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${operations.length} mark entries`,
    });
  } catch (error) {
    next(error);
  }
};
