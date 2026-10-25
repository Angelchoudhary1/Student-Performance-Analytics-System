
const { spawn } = require('child_process');
const path = require('path');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');

/**
 * JavaScript fallback prediction engine
 */
const runFallbackPrediction = (features) => {
  const {
    attendanceRate = 80.0,
    internalAvg = 15.0,
    assignmentAvg = 8.0,
    midtermAvg = 22.0,
    previousCgpa = 7.5,
    backlogs = 0,
    studyHoursPerWeek = 14.0,
  } = features;

  const normScore =
    (attendanceRate / 100) * 0.2 +
    (internalAvg / 20) * 0.15 +
    (assignmentAvg / 10) * 0.1 +
    (midtermAvg / 30) * 0.25 +
    (previousCgpa / 10) * 0.3 -
    backlogs * 0.08;

  const predictedCGPA = Number(
    Math.min(10, Math.max(2, normScore * 10)).toFixed(2)
  );

  let riskLevel = 'Low';
  let passProbability = 92;

  if (predictedCGPA < 5 || attendanceRate < 60 || backlogs >= 2) {
    riskLevel = 'Critical';
    passProbability = Number(
      Math.max(15, predictedCGPA * 8).toFixed(1)
    );
  } else if (
    predictedCGPA < 6.2 ||
    attendanceRate < 72 ||
    backlogs === 1
  ) {
    riskLevel = 'High';
    passProbability = Number(
      Math.max(45, predictedCGPA * 10).toFixed(1)
    );
  } else if (predictedCGPA < 7.5 || attendanceRate < 80) {
    riskLevel = 'Moderate';
    passProbability = Number(
      Math.max(75, predictedCGPA * 11).toFixed(1)
    );
  } else {
    riskLevel = 'Low';
    passProbability = Number(
      Math.min(
        99.5,
        85 + (predictedCGPA - 7.5) * 5
      ).toFixed(1)
    );
  }

  const getGradeLetter = (cgpa) => {
    if (cgpa >= 9) return 'O';
    if (cgpa >= 8) return 'A+';
    if (cgpa >= 7) return 'A';
    if (cgpa >= 6) return 'B+';
    if (cgpa >= 5) return 'B';
    if (cgpa >= 4) return 'C';
    return 'F';
  };

  const riskFactors = [];
  const recommendations = [];

  if (attendanceRate < 75) {
    riskFactors.push({
      factor: `Low Attendance (${attendanceRate}%)`,
      severity: attendanceRate < 65 ? 'High' : 'Medium',
      impact:
        'Low attendance may affect eligibility for end-term examinations.',
    });

    recommendations.push({
      title: 'Mandatory Attendance Recovery',
      action:
        'Consult your faculty and plan additional attendance to meet the required threshold.',
      priority: attendanceRate < 65 ? 'Urgent' : 'High',
    });
  }

  if (midtermAvg < 18) {
    riskFactors.push({
      factor: `Midterm Evaluation Deficit (${midtermAvg}/30)`,
      severity: midtermAvg < 12 ? 'High' : 'Medium',
      impact: 'Low midterm marks may reduce the overall assessment score.',
    });

    recommendations.push({
      title: 'Remedial Concept Sessions',
      action:
        'Attend faculty doubt-clearing sessions and revise core topics.',
      priority: 'High',
    });
  }

  if (internalAvg < 12) {
    riskFactors.push({
      factor: `Internal Assessment Deficit (${internalAvg}/20)`,
      severity: 'Medium',
      impact: 'Low internal marks reduce the available semester grade buffer.',
    });
  }

  if (backlogs > 0) {
    riskFactors.push({
      factor: `Active Subject Backlogs (${backlogs})`,
      severity: 'High',
      impact: 'Pending subjects may affect timely degree completion.',
    });

    recommendations.push({
      title: 'Backlog Clearance Plan',
      action:
        `Prepare a study plan for ${backlogs} pending subject(s) and check supplementary examination dates.`,
      priority: 'Urgent',
    });
  }

  if (studyHours < 10) {
    recommendations.push({
      title: 'Study Schedule Optimization',
      action:
        'Gradually increase focused weekly study time and review progress.',
      priority: 'Medium',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Advanced Learning',
      action:
        'Explore research projects and advanced learning opportunities.',
      priority: 'Low',
    });
  }

  const onTimeGraduationProbability = Number(
    Math.min(
      99,
      Math.max(
        20,
        100 - backlogs * 22 - (10 - predictedCGPA) * 5
      )
    ).toFixed(1)
  );

  return {
    predictedCGPA,
    predictedGrade: getGradeLetter(predictedCGPA),
    riskLevel,
    passProbability,
    onTimeGraduationProbability,
    featureInputs: {
      attendanceRate,
      internalAvg,
      assignmentAvg,
      midtermAvg,
      previousCgpa,
      backlogs,
      studyHoursPerWeek,
    },
    riskFactors,
    recommendations,
    modelType: 'JavaScript Fallback Prediction Engine',
    accuracyScore: null,
  };
};

/**
 * Extract student academic features from MongoDB
 */
const extractStudentFeatures = async (student) => {
  const marks = await Mark.find({ student: student._id });
  const attendanceRecords = await Attendance.find({
    student: student._id,
  });

  let internalAvg = 15;
  let assignmentAvg = 8;
  let midtermAvg = 22;

  if (marks.length > 0) {
    const totalInternal = marks.reduce(
      (sum, mark) => sum + (mark.internalMarks || 0),
      0
    );

    const totalAssignment = marks.reduce(
      (sum, mark) => sum + (mark.assignmentMarks || 0),
      0
    );

    const totalMidterm = marks.reduce(
      (sum, mark) => sum + (mark.midtermMarks || 0),
      0
    );

    internalAvg = Number((totalInternal / marks.length).toFixed(2));
    assignmentAvg = Number((totalAssignment / marks.length).toFixed(2));
    midtermAvg = Number((totalMidterm / marks.length).toFixed(2));
  }

  let attendanceRate = student.attendanceRate || 80;

  if (attendanceRecords.length > 0) {
    const totalClasses = attendanceRecords.reduce(
      (sum, record) => sum + (record.totalClasses || 0),
      0
    );

    const attendedClasses = attendanceRecords.reduce(
      (sum, record) => sum + (record.attendedClasses || 0),
      0
    );

    if (totalClasses > 0) {
      attendanceRate = Number(
        ((attendedClasses / totalClasses) * 100).toFixed(2)
      );
    }
  }

  return {
    attendanceRate,
    internalAvg,
    assignmentAvg,
    midtermAvg,
    previousCgpa: student.previousCgpa || student.cgpa || 7,
    backlogs: student.backlogs || 0,
    studyHoursPerWeek: Math.max(
      4,
      Math.round(attendanceRate / 6)
    ),
  };
};

/**
 * Run the local Python prediction script as a fallback
 */
const executeLocalPythonPrediction = (features) => {
  return new Promise((resolve) => {
    const pythonExecutable = process.env.PYTHON_PATH || 'python';

    const scriptPath = path.join(
      __dirname,
      '../../ml_service/predict.py'
    );

    let stdoutData = '';

    try {
      const pyProcess = spawn(pythonExecutable, [
        scriptPath,
        JSON.stringify(features),
      ]);

      pyProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pyProcess.on('error', (error) => {
        console.error('Local Python execution failed:', error.message);
        resolve(runFallbackPrediction(features));
      });

      pyProcess.on('close', (code) => {
        try {
          const parsed = JSON.parse(stdoutData.trim());

          if (code === 0 && parsed && !parsed.error) {
            return resolve(parsed);
          }
        } catch (error) {
          console.error('Invalid local Python response:', error.message);
        }

        resolve(runFallbackPrediction(features));
      });
    } catch (error) {
      console.error('Could not start Python:', error.message);
      resolve(runFallbackPrediction(features));
    }
  });
};

/**
 * Predict using the deployed Render ML API.
 * If it fails, try local Python, then JavaScript fallback.
 */
const executeMLPrediction = async (features) => {
  const apiUrl = process.env.ML_API_URL;

  if (apiUrl) {
    try {
      const response = await fetch(
        `${apiUrl.replace(/\/+$/, '')}/predict`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(features),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (
          result &&
          !result.error &&
          result.predictedCGPA !== undefined
        ) {
          return result;
        }

        console.error('ML API returned an invalid prediction response.');
      } else {
        console.error('ML API HTTP status:', response.status);
      }
    } catch (error) {
      console.error('Remote ML API failed:', error.message);
    }
  }

  // Try local Python if the remote API is unavailable.
  return executeLocalPythonPrediction(features);
};

module.exports = {
  extractStudentFeatures,
  executeMLPrediction,
  runFallbackPrediction,
};
