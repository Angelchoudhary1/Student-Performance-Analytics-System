const mongoose = require('mongoose');
const { calculateGradeDetails } = require('../utils/gradeCalculator');

const markSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    internalMarks: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 20,
    },
    assignmentMarks: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 10,
    },
    midtermMarks: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 30,
    },
    endtermMarks: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 40,
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'],
      default: 'F',
    },
    gradePoint: {
      type: Number,
      default: 0.0,
    },
    result: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Fail',
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to compute total and grade details automatically
markSchema.pre('save', function (next) {
  this.totalMarks = Number(
    (
      (this.internalMarks || 0) +
      (this.assignmentMarks || 0) +
      (this.midtermMarks || 0) +
      (this.endtermMarks || 0)
    ).toFixed(2)
  );

  const { percentage, grade, gradePoint, result } = calculateGradeDetails(this.totalMarks, 100);
  this.percentage = percentage;
  this.grade = grade;
  this.gradePoint = gradePoint;
  this.result = result;

  next();
});

// Compound unique index ensuring 1 entry per student per subject per semester
markSchema.index({ student: 1, subject: 1, semester: 1 }, { unique: true });
markSchema.index({ subject: 1, semester: 1 });
markSchema.index({ student: 1, semester: 1 });

module.exports = mongoose.model('Mark', markSchema);
