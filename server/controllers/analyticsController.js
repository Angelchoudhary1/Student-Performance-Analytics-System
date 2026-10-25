const {
  getDashboardKPIsPipeline,
  getPerformanceBySemesterPipeline,
  getAverageMarksBySubjectPipeline,
  getAttendanceDistributionPipeline,
  getGradeDistributionPipeline,
  getDepartmentPerformancePipeline,
  getTopStudentsPipeline,
  getSmartRankingsPipeline,
  getAtRiskStudentsPipeline,
} = require('../utils/mongoAggregations');

// @desc    Get complete Admin Dashboard analytics (KPIs + All 6 Charts)
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const startTime = Date.now();

    const [
      kpis,
      performanceBySemester,
      averageMarksBySubject,
      attendanceDistribution,
      gradeDistribution,
      departmentPerformance,
      topStudents,
    ] = await Promise.all([
      getDashboardKPIsPipeline(),
      getPerformanceBySemesterPipeline(),
      getAverageMarksBySubjectPipeline(),
      getAttendanceDistributionPipeline(),
      getGradeDistributionPipeline(),
      getDepartmentPerformancePipeline(),
      getTopStudentsPipeline(10),
    ]);

    const executionTimeMs = Date.now() - startTime;

    res.status(200).json({
      success: true,
      executionTimeMs,
      data: {
        kpis,
        charts: {
          performanceBySemester,
          averageMarksBySubject,
          attendanceDistribution,
          gradeDistribution,
          departmentPerformance,
          topStudents,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Smart Student Rankings
// @route   GET /api/analytics/rankings
// @access  Private
exports.getRankings = async (req, res, next) => {
  try {
    const { department, semester } = req.query;
    const rankings = await getSmartRankingsPipeline({ departmentId: department, semester });

    res.status(200).json({
      success: true,
      count: rankings.length,
      data: rankings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get At-Risk Students Analysis
// @route   GET /api/analytics/at-risk
// @access  Private
exports.getAtRiskStudents = async (req, res, next) => {
  try {
    const { severity, department } = req.query;
    const atRiskStudents = await getAtRiskStudentsPipeline({ severity, departmentId: department });

    res.status(200).json({
      success: true,
      count: atRiskStudents.length,
      data: atRiskStudents,
    });
  } catch (error) {
    next(error);
  }
};
