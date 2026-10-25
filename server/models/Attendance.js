const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      required: true,
      default: 'Present',
    },
    topic: {
      type: String,
      default: '',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: true }
);

const attendanceSchema = new mongoose.Schema(
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
    totalClasses: {
      type: Number,
      default: 0,
      min: 0,
    },
    attendedClasses: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 100.0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['Safe', 'Warning', 'Critical'],
      default: 'Safe',
    },
    records: [attendanceRecordSchema],
  },
  {
    timestamps: true,
  }
);

attendanceSchema.pre('save', function (next) {
  if (this.totalClasses > 0) {
    this.percentage = Number(((this.attendedClasses / this.totalClasses) * 100).toFixed(2));
  } else {
    this.percentage = 100.0;
  }

  if (this.percentage >= 75) {
    this.status = 'Safe';
  } else if (this.percentage >= 65) {
    this.status = 'Warning';
  } else {
    this.status = 'Critical';
  }

  next();
});

// Compound unique index for single aggregate record per student-subject-semester
attendanceSchema.index({ student: 1, subject: 1, semester: 1 }, { unique: true });
attendanceSchema.index({ percentage: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
