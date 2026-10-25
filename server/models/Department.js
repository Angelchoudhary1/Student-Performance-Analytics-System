const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    headOfDepartment: {
      type: String,
      default: 'TBD',
    },
    building: {
      type: String,
      default: 'Academic Block A',
    },
    establishedYear: {
      type: Number,
      default: 2010,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

departmentSchema.index({ code: 1 });

module.exports = mongoose.model('Department', departmentSchema);
