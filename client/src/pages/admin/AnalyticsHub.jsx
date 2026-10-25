import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import toast from 'react-hot-toast';

export default function AnalyticsHub() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getDashboardAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (error) {
      toast.error('Failed to execute MongoDB aggregation analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner text="Executing multi-stage MongoDB aggregations..." size="lg" />;

  const { kpis, charts } = analytics || {};
  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

  const radarData = (charts?.departmentPerformance || []).map((dp) => ({
    department: dp.code,
    CGPA: dp.avgCGPA * 10,
    Attendance: dp.avgAttendance,
    Students: dp.studentCount * 5,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          MongoDB Aggregation & Analytics Hub
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800">
            Pipeline Analytics
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          In-depth multi-dimensional academic metrics computed via native MongoDB Aggregation Pipelines
        </p>
      </div>

      {/* Pipeline Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-brand-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pass Rate Efficiency</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{kpis?.passPercentage}%</h3>
          <p className="text-xs text-slate-500 mt-1">Aggregated across all credit evaluations</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institutional CGPA</span>
            <Award className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{kpis?.avgCGPA} / 10.0</h3>
          <p className="text-xs text-slate-500 mt-1">Weighted student grade point average</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Health</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{kpis?.avgAttendance}%</h3>
          <p className="text-xs text-slate-500 mt-1">Institutional aggregate attendance compliance</p>
        </div>
      </div>

      {/* Deep Dive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semester Performance Multi-Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Semester Component Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Averages for Internal, Midterm, and Endterm per semester ($group, $round)
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.performanceBySemester || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="semesterLabel" stroke="#94a3b8" fontSize={11} />
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="avgInternal" name="Internal Avg (/20)" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="avgMidterm" name="Midterm Avg (/30)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="avgEndterm" name="Endterm Avg (/40)" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Comparative Radar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Department Performance Radar
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Multi-metric comparison of CGPA vs Attendance across departments
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid opacity={0.2} />
                <PolarAngleAxis dataKey="department" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis stroke="#94a3b8" fontSize={10} />
                <Radar name="CGPA Index (x10)" dataKey="CGPA" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Attendance %" dataKey="Attendance" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Breakdown Table & Pie */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Grade Distribution Analysis
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Statistical breakdown of letter grades across all courses ($group by grade)
          </p>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.gradeDistribution || []}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={40}
                  >
                    {(charts?.gradeDistribution || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.grade === 'F' ? '#ef4444' : COLORS[index % COLORS.length]}
                      />
                    ))}
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

            <div className="space-y-1.5">
              {(charts?.gradeDistribution || []).map((g, idx) => (
                <div key={g.grade} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: g.grade === 'F' ? '#ef4444' : COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Grade {g.grade}</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">{g.count} marks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highest & Lowest Scoring Subjects Analysis */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Subject Evaluation Ranges
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Min, Max, and Mean scores by subject ($min, $max, $avg)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="pb-2">Course</th>
                  <th className="pb-2 text-center">Avg Score</th>
                  <th className="pb-2 text-center">Highest</th>
                  <th className="pb-2 text-center">Lowest</th>
                  <th className="pb-2 text-right">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(charts?.averageMarksBySubject || []).slice(0, 6).map((sub) => (
                  <tr key={sub.subjectCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5">
                      <span className="font-bold text-slate-900 dark:text-white block">{sub.subjectName}</span>
                      <span className="font-mono text-[10px] text-brand-600">{sub.subjectCode}</span>
                    </td>
                    <td className="py-2.5 text-center font-extrabold text-brand-600 dark:text-brand-400">
                      {sub.avgScore}
                    </td>
                    <td className="py-2.5 text-center font-semibold text-emerald-600">{sub.highestScore}</td>
                    <td className="py-2.5 text-center font-semibold text-rose-500">{sub.lowestScore}</td>
                    <td className="py-2.5 text-right font-medium text-slate-500">{sub.studentsCount}</td>
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
