const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
      default: 3,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    syllabus: [
      {
        unit: Number,
        title: String,
        description: String,
      },
    ],
    maxInternal: { type: Number, default: 20 },
    maxAssignment: { type: Number, default: 10 },
    maxMidterm: { type: Number, default: 30 },
    maxEndterm: { type: Number, default: 40 },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ code: 1 });
subjectSchema.index({ department: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
