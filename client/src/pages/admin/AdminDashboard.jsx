import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  UserCheck,
  BookOpen,
  Award,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await analyticsService.getDashboardAnalytics();
      if (res.success) {
        setData(res.data);
        if (isManual) toast.success(`MongoDB Aggregations updated in ${res.executionTimeMs}ms`);
      }
    } catch (error) {
      toast.error('Failed to load dashboard metrics from MongoDB');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner text="Computing MongoDB Aggregation Pipelines..." size="lg" />;

  const { kpis, charts } = data || {};
  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Academic Performance Dashboard
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800">
              Live NoSQL
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time MongoDB Aggregation ($facet, $group, $bucket) & Predictive Risk Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/predictions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Prediction Studio
          </Link>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Pipelines
          </button>
        </div>
      </div>

      {/* 7 TOP KPI CARDS (ALL FROM MONGODB AGGREGATION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          title="Total Students"
          value={kpis?.totalStudents || 0}
          subtitle="Enrolled active"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Faculty"
          value={kpis?.totalFaculty || 0}
          subtitle="Teaching staff"
          icon={UserCheck}
          color="blue"
        />
        <StatCard
          title="Total Subjects"
          value={kpis?.totalSubjects || 0}
          subtitle="Active courses"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Average CGPA"
          value={kpis?.avgCGPA || '0.00'}
          subtitle="Out of 10.0"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Avg Attendance"
          value={`${kpis?.avgAttendance || 0}%`}
          subtitle="Institutional avg"
          icon={CalendarCheck}
          color="amber"
        />
        <StatCard
          title="Pass Percentage"
          value={`${kpis?.passPercentage || 0}%`}
          subtitle="All semesters"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="At-Risk Students"
          value={kpis?.atRiskStudents || 0}
          subtitle="Attendance < 75% / Low GPA"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* CHARTS GRID (6 REQUIRED CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Student Performance by Semester */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Student Performance by Semester
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Average percentage and pass rate ($group by semester)
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              $group
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.performanceBySemester || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="semesterLabel" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="avgScore" fill="#6366f1" name="Average Score %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="passRate" fill="#10b981" name="Pass Rate %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Average Marks by Subject */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Average Marks by Subject
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluation breakdown ($lookup from subjects)
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              $lookup
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.averageMarksBySubject || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <YAxis dataKey="subjectCode" type="category" stroke="#94a3b8" fontSize={11} width={65} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="avgScore" fill="#3b82f6" name="Total Avg" radius={[0, 4, 4, 0]} />
                <Bar dataKey="avgMidterm" fill="#f59e0b" name="Midterm Avg" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Attendance Distribution */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                3. Attendance Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student counts in attendance ranges ($bucket aggregation)
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              $bucket
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.attendanceDistribution || []}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  label={({ range, count }) => `${range}: ${count}`}
                >
                  {(charts?.attendanceDistribution || []).map((entry, index) => {
                    const bucketColors = {
                      'Critical (< 60%)': '#ef4444',
                      'Warning (60% - 74%)': '#f59e0b',
                      'Good (75% - 84%)': '#3b82f6',
                      'Excellent (85% - 100%)': '#10b981',
                    };
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={bucketColors[entry.range] || COLORS[index % COLORS.length]}
                      />
                    );
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Grade Distribution */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                4. Grade Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grades across all evaluations (O, A+, A, B+, B, C, F)
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              $group
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.gradeDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="grade" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Total Grades Awarded" radius={[4, 4, 0, 0]}>
                  {(charts?.gradeDistribution || []).map((entry, index) => (
                    <Cell
                      key={`grade-cell-${index}`}
                      fill={entry.grade === 'F' ? '#ef4444' : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Department Performance */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                5. Department Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Departmental Average CGPA vs Attendance ($group by dept)
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              $group
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.departmentPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="avgCGPA" fill="#8b5cf6" name="Average CGPA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atRiskStudents" fill="#ef4444" name="At-Risk Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Top 10 Students Leaderboard */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                6. Top Performing Students
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top CGPAs computed with MongoDB sorting & projection
              </p>
            </div>
            <Link
              to="/admin/rankings"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              Full Rankings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="pb-2.5">Rank</th>
                  <th className="pb-2.5">Student</th>
                  <th className="pb-2.5">Department</th>
                  <th className="pb-2.5 text-right">Attendance</th>
                  <th className="pb-2.5 text-right">CGPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(charts?.topStudents || []).slice(0, 6).map((st, idx) => (
                  <tr key={st._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 font-bold text-brand-600">
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                      <Link to={`/admin/students/${st._id}`} className="hover:underline">
                        {st.name}
                      </Link>
                      <span className="block text-[10px] text-slate-400">{st.rollNo}</span>
                    </td>
                    <td className="py-2.5 text-slate-500">{st.departmentCode}</td>
                    <td className="py-2.5 text-right font-medium">{st.attendanceRate}%</td>
                    <td className="py-2.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      {st.cgpa.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
