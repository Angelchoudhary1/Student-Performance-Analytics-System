const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
    },
    predictedCGPA: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    predictedGrade: {
      type: String,
      default: 'B+',
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      required: true,
      default: 'Low',
    },
    passProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    onTimeGraduationProbability: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    featureInputs: {
      attendanceRate: Number,
      internalAvg: Number,
      assignmentAvg: Number,
      midtermAvg: Number,
      previousCgpa: Number,
      backlogs: Number,
      studyHoursPerWeek: Number,
    },
    riskFactors: [
      {
        factor: String,
        severity: {
          type: String,
          enum: ['Low', 'Medium', 'High'],
        },
        impact: String,
      },
    ],
    recommendations: [
      {
        title: String,
        action: String,
        priority: {
          type: String,
          enum: ['Low', 'Medium', 'High', 'Urgent'],
        },
      },
    ],
    modelType: {
      type: String,
      default: 'Scikit-Learn Random Forest Ensemble',
    },
    accuracyScore: {
      type: Number,
      default: 94.2,
    },
  },
  {
    timestamps: true,
  }
);

predictionSchema.index({ riskLevel: 1, passProbability: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
