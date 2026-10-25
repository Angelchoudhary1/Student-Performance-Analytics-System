const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
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
      default: 1,
    },
    section: {
      type: String,
      default: 'A',
      uppercase: true,
    },
    enrollmentYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    previousCgpa: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 10.0,
    },
    cgpa: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 10.0,
    },
    attendanceRate: {
      type: Number,
      default: 100.0,
      min: 0.0,
      max: 100.0,
    },
    status: {
      type: String,
      enum: ['Active', 'Graduated', 'Suspended', 'On Leave'],
      default: 'Active',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    guardian: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: 'Parent' },
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    backlogs: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB Indexes for high-performance aggregations & search
studentSchema.index({ rollNo: 1 });
studentSchema.index({ department: 1, semester: 1 });
studentSchema.index({ cgpa: -1 });
studentSchema.index({ attendanceRate: 1, cgpa: 1 });
studentSchema.index({ name: 'text', rollNo: 'text', email: 'text' });

module.exports = mongoose.model('Student', studentSchema);
