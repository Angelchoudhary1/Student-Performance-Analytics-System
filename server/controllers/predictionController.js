const Student = require('../models/Student');
const Prediction = require('../models/Prediction');
const { extractStudentFeatures, executeMLPrediction, runFallbackPrediction } = require('../utils/mlBridge');

// @desc    Predict for single student ID
// @route   POST /api/predictions/student/:id
// @access  Private
exports.predictStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const features = await extractStudentFeatures(student);
    const predictionResult = await executeMLPrediction(features);

    const prediction = await Prediction.findOneAndUpdate(
      { student: student._id },
      {
        ...predictionResult,
        predictedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Interactive AI Simulator (what-if analysis)
// @route   POST /api/predictions/simulate
// @access  Private
exports.simulatePrediction = async (req, res, next) => {
  try {
    const features = {
      attendanceRate: Number(req.body.attendanceRate || 80.0),
      internalAvg: Number(req.body.internalAvg || 15.0),
      assignmentAvg: Number(req.body.assignmentAvg || 8.0),
      midtermAvg: Number(req.body.midtermAvg || 22.0),
      previousCgpa: Number(req.body.previousCgpa || 7.5),
      backlogs: Number(req.body.backlogs || 0),
      studyHoursPerWeek: Number(req.body.studyHoursPerWeek || 14.0),
    };

    const prediction = await executeMLPrediction(features);

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch predict for all students
// @route   POST /api/predictions/batch
// @access  Private (Admin)
exports.batchPredict = async (req, res, next) => {
  try {
    const students = await Student.find({ status: 'Active' });
    let count = 0;

    for (const s of students) {
      const features = await extractStudentFeatures(s);
      const predResult = await executeMLPrediction(features);
      await Prediction.findOneAndUpdate(
        { student: s._id },
        { ...predResult, predictedAt: new Date() },
        { upsert: true }
      );
      count++;
    }

    res.status(200).json({
      success: true,
      message: `Batch prediction successfully updated for ${count} students.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all predictions with student info
// @route   GET /api/predictions
// @access  Private
exports.getAllPredictions = async (req, res, next) => {
  try {
    const { riskLevel, department } = req.query;
    const query = {};

    if (riskLevel && riskLevel !== 'all') {
      query.riskLevel = riskLevel;
    }

    const predictions = await Prediction.find(query)
      .populate({
        path: 'student',
        populate: { path: 'department', select: 'name code' },
      })
      .sort({ predictedCGPA: 1 });

    // Filter by department if provided
    let filtered = predictions;
    if (department && department !== 'all') {
      filtered = predictions.filter((p) => p.student?.department?._id?.toString() === department);
    }

    // Risk counts summary
    const summary = {
      total: filtered.length,
      critical: filtered.filter((p) => p.riskLevel === 'Critical').length,
      high: filtered.filter((p) => p.riskLevel === 'High').length,
      moderate: filtered.filter((p) => p.riskLevel === 'Moderate').length,
      low: filtered.filter((p) => p.riskLevel === 'Low').length,
      avgPredictedCGPA:
        filtered.length > 0
          ? Number((filtered.reduce((acc, p) => acc + (p.predictedCGPA || 0), 0) / filtered.length).toFixed(2))
          : 0,
    };

    res.status(200).json({
      success: true,
      summary,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};
