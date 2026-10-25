const mongoose = require('mongoose');
const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Department = require('../models/Department');

/**
 * High-Performance MongoDB Aggregations Suite
 */

// 1. Core Academic KPI Aggregation
const getDashboardKPIsPipeline = async () => {
  const [totalStudents, totalFaculty, totalSubjects, totalDepartments] = await Promise.all([
    Student.countDocuments({ status: 'Active' }),
    Faculty.countDocuments(),
    Subject.countDocuments(),
    Department.countDocuments(),
  ]);

  // Aggregate student averages and pass percentage
  const studentAverages = await Student.aggregate([
    {
      $match: { status: 'Active' },
    },
    {
      $group: {
        _id: null,
        avgCGPA: { $avg: '$cgpa' },
        avgAttendance: { $avg: '$attendanceRate' },
        totalActive: { $sum: 1 },
      },
    },
  ]);

  // Aggregate marks for pass percentage
  const markStats = await Mark.aggregate([
    {
      $group: {
        _id: null,
        totalMarksCount: { $sum: 1 },
        passedCount: {
          $sum: { $cond: [{ $eq: ['$result', 'Pass'] }, 1, 0] },
        },
        avgTotalMarks: { $avg: '$totalMarks' },
      },
    },
  ]);

  // At-risk students count (Attendance < 75 OR CGPA < 6.0 OR backlogs > 0)
  const atRiskCount = await Student.countDocuments({
    status: 'Active',
    $or: [{ attendanceRate: { $lt: 75 } }, { cgpa: { $lt: 6.0 } }, { backlogs: { $gt: 0 } }],
  });

  const avgCGPA = studentAverages.length > 0 ? Number(studentAverages[0].avgCGPA.toFixed(2)) : 0;
  const avgAttendance = studentAverages.length > 0 ? Number(studentAverages[0].avgAttendance.toFixed(2)) : 0;
  const passPercentage =
    markStats.length > 0 && markStats[0].totalMarksCount > 0
      ? Number(((markStats[0].passedCount / markStats[0].totalMarksCount) * 100).toFixed(2))
      : 85.0;

  return {
    totalStudents,
    totalFaculty,
    totalSubjects,
    totalDepartments,
    avgCGPA,
    avgAttendance,
    passPercentage,
    atRiskStudents: atRiskCount,
    avgMarks: markStats.length > 0 ? Number(markStats[0].avgTotalMarks.toFixed(2)) : 0,
  };
};

// 2. Student Performance By Semester
const getPerformanceBySemesterPipeline = async () => {
  return await Mark.aggregate([
    {
      $group: {
        _id: '$semester',
        avgPercentage: { $avg: '$percentage' },
        avgInternal: { $avg: '$internalMarks' },
        avgMidterm: { $avg: '$midtermMarks' },
        avgEndterm: { $avg: '$endtermMarks' },
        totalSubmissions: { $sum: 1 },
        passCount: {
          $sum: { $cond: [{ $eq: ['$result', 'Pass'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        semester: '$_id',
        semesterLabel: { $concat: ['Sem ', { $toString: '$_id' }] },
        avgScore: { $round: ['$avgPercentage', 2] },
        avgInternal: { $round: ['$avgInternal', 2] },
        avgMidterm: { $round: ['$avgMidterm', 2] },
        avgEndterm: { $round: ['$avgEndterm', 2] },
        passRate: {
          $round: [
            {
              $multiply: [{ $divide: ['$passCount', { $max: ['$totalSubmissions', 1] }] }, 100],
            },
            2,
          ],
        },
        _id: 0,
      },
    },
    { $sort: { semester: 1 } },
  ]);
};

// 3. Average Marks By Subject
const getAverageMarksBySubjectPipeline = async () => {
  return await Mark.aggregate([
    {
      $group: {
        _id: '$subject',
        avgTotal: { $avg: '$totalMarks' },
        avgInternal: { $avg: '$internalMarks' },
        avgMidterm: { $avg: '$midtermMarks' },
        avgEndterm: { $avg: '$endtermMarks' },
        highestTotal: { $max: '$totalMarks' },
        lowestTotal: { $min: '$totalMarks' },
        studentsCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subjectInfo',
      },
    },
    { $unwind: '$subjectInfo' },
    {
      $project: {
        subjectId: '$_id',
        subjectCode: '$subjectInfo.code',
        subjectName: '$subjectInfo.name',
        credits: '$subjectInfo.credits',
        avgScore: { $round: ['$avgTotal', 2] },
        avgInternal: { $round: ['$avgInternal', 2] },
        avgMidterm: { $round: ['$avgMidterm', 2] },
        avgEndterm: { $round: ['$avgEndterm', 2] },
        highestScore: '$highestTotal',
        lowestScore: '$lowestTotal',
        studentsCount: '$studentsCount',
        _id: 0,
      },
    },
    { $sort: { avgScore: -1 } },
    { $limit: 10 },
  ]);
};

// 4. Attendance Distribution Aggregation
const getAttendanceDistributionPipeline = async () => {
  return await Student.aggregate([
    { $match: { status: 'Active' } },
    {
      $bucket: {
        groupBy: '$attendanceRate',
        boundaries: [0, 60, 75, 85, 101],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          students: { $push: { name: '$name', rollNo: '$rollNo', rate: '$attendanceRate' } },
        },
      },
    },
    {
      $project: {
        range: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 0] }, then: 'Critical (< 60%)' },
              { case: { $eq: ['$_id', 60] }, then: 'Warning (60% - 74%)' },
              { case: { $eq: ['$_id', 75] }, then: 'Good (75% - 84%)' },
              { case: { $eq: ['$_id', 85] }, then: 'Excellent (85% - 100%)' },
            ],
            default: 'Other',
          },
        },
        count: 1,
        _id: 0,
      },
    },
  ]);
};

// 5. Grade Distribution Aggregation
const getGradeDistributionPipeline = async () => {
  const grades = await Mark.aggregate([
    {
      $group: {
        _id: '$grade',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        grade: '$_id',
        count: 1,
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ]);

  const orderMap = { O: 1, 'A+': 2, A: 3, 'B+': 4, B: 5, C: 6, F: 7 };
  return grades.sort((a, b) => (orderMap[a.grade] || 99) - (orderMap[b.grade] || 99));
};

// 6. Department Performance Aggregation
const getDepartmentPerformancePipeline = async () => {
  return await Student.aggregate([
    { $match: { status: 'Active' } },
    {
      $group: {
        _id: '$department',
        studentCount: { $sum: 1 },
        avgCGPA: { $avg: '$cgpa' },
        avgAttendance: { $avg: '$attendanceRate' },
        atRiskStudents: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $lt: ['$attendanceRate', 75] },
                  { $lt: ['$cgpa', 6.0] },
                  { $gt: ['$backlogs', 0] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'deptInfo',
      },
    },
    { $unwind: '$deptInfo' },
    {
      $project: {
        departmentId: '$_id',
        code: '$deptInfo.code',
        name: '$deptInfo.name',
        studentCount: '$studentCount',
        avgCGPA: { $round: ['$avgCGPA', 2] },
        avgAttendance: { $round: ['$avgAttendance', 2] },
        atRiskStudents: '$atRiskStudents',
        _id: 0,
      },
    },
    { $sort: { avgCGPA: -1 } },
  ]);
};

// 7. Top 10 Performing Students
const getTopStudentsPipeline = async (limit = 10) => {
  return await Student.aggregate([
    { $match: { status: 'Active' } },
    { $sort: { cgpa: -1, attendanceRate: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'deptInfo',
      },
    },
    { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        rollNo: 1,
        name: 1,
        email: 1,
        semester: 1,
        cgpa: 1,
        attendanceRate: 1,
        departmentName: '$deptInfo.name',
        departmentCode: '$deptInfo.code',
      },
    },
  ]);
};

// 8. Smart Rankings Pipeline (Overall, Department, and Semester Rank)
const getSmartRankingsPipeline = async ({ departmentId, semester }) => {
  const matchStage = { status: 'Active' };
  if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
    matchStage.department = new mongoose.Types.ObjectId(departmentId);
  }
  if (semester) {
    matchStage.semester = Number(semester);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'deptInfo',
      },
    },
    { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
    // Compute a single composite score so $denseRank has exactly one sortBy field
    {
      $addFields: {
        rankScore: {
          $add: [
            { $multiply: [{ $ifNull: ['$cgpa', 0] }, 10] },
            { $divide: [{ $ifNull: ['$attendanceRate', 0] }, 100] },
          ],
        },
      },
    },
    {
      $setWindowFields: {
        partitionBy: '$department',
        sortBy: { rankScore: -1 },
        output: {
          departmentRank: { $denseRank: {} },
        },
      },
    },
    {
      $setWindowFields: {
        sortBy: { rankScore: -1 },
        output: {
          overallRank: { $denseRank: {} },
        },
      },
    },
    {
      $project: {
        _id: 1,
        rollNo: 1,
        name: 1,
        email: 1,
        semester: 1,
        section: 1,
        cgpa: 1,
        attendanceRate: 1,
        backlogs: 1,
        overallRank: 1,
        departmentRank: 1,
        departmentName: '$deptInfo.name',
        departmentCode: '$deptInfo.code',
      },
    },
    { $sort: { overallRank: 1 } },
  ];

  return await Student.aggregate(pipeline);
};

// 9. At-Risk Students Detailed Pipeline
const getAtRiskStudentsPipeline = async ({ severity = 'all', departmentId }) => {
  const matchStage = { status: 'Active' };
  if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
    matchStage.department = new mongoose.Types.ObjectId(departmentId);
  }

  return await Student.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        riskScore: {
          $add: [
            { $cond: [{ $lt: ['$attendanceRate', 60] }, 40, { $cond: [{ $lt: ['$attendanceRate', 75] }, 25, 0] }] },
            { $cond: [{ $lt: ['$cgpa', 5.0] }, 40, { $cond: [{ $lt: ['$cgpa', 6.5] }, 20, 0] }] },
            { $multiply: ['$backlogs', 15] },
          ],
        },
      },
    },
    {
      $addFields: {
        riskCategory: {
          $switch: {
            branches: [
              { case: { $gte: ['$riskScore', 60] }, then: 'Critical' },
              { case: { $gte: ['$riskScore', 35] }, then: 'High' },
              { case: { $gt: ['$riskScore', 10] }, then: 'Moderate' },
            ],
            default: 'Low',
          },
        },
      },
    },
    {
      $match: severity === 'all' ? { riskScore: { $gt: 10 } } : { riskCategory: severity },
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'deptInfo',
      },
    },
    { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'predictions',
        localField: '_id',
        foreignField: 'student',
        as: 'predictionInfo',
      },
    },
    { $unwind: { path: '$predictionInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        rollNo: 1,
        name: 1,
        email: 1,
        phone: 1,
        semester: 1,
        cgpa: 1,
        attendanceRate: 1,
        backlogs: 1,
        riskScore: 1,
        riskCategory: 1,
        departmentName: '$deptInfo.name',
        departmentCode: '$deptInfo.code',
        aiPrediction: '$predictionInfo',
      },
    },
    { $sort: { riskScore: -1, attendanceRate: 1 } },
  ]);
};

module.exports = {
  getDashboardKPIsPipeline,
  getPerformanceBySemesterPipeline,
  getAverageMarksBySubjectPipeline,
  getAttendanceDistributionPipeline,
  getGradeDistributionPipeline,
  getDepartmentPerformancePipeline,
  getTopStudentsPipeline,
  getSmartRankingsPipeline,
  getAtRiskStudentsPipeline,
};
