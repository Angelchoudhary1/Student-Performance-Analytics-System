import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { analyticsService } from '../../services/analyticsService';
import StatCard from '../../components/common/StatCard';
import RiskBadge from '../../components/common/RiskBadge';
import GradeBadge from '../../components/common/GradeBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  User,
  GraduationCap,
  CalendarCheck,
  CheckCircle,
  XCircle,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  BookOpen,
  BrainCircuit,
  Lightbulb,
  ShieldAlert,
  Clock,
  RefreshCw,
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
} from 'recharts';
import toast from 'react-hot-toast';

export default function StudentProfile() {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await studentService.getStudentById(id);
      if (res.success) {
        setProfileData(res.data);
      }
    } catch (error) {
      toast.error('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const handleRefreshPrediction = async () => {
    try {
      setPredicting(true);
      const res = await analyticsService.predictStudent(id);
      if (res.success) {
        toast.success('AI Prediction updated via Scikit-Learn ML Engine!');
        fetchStudentProfile();
      }
    } catch (err) {
      toast.error('Failed to run AI prediction');
    } finally {
      setPredicting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading detailed student academic profile..." size="lg" />;
  if (!profileData) return <div className="p-8 text-center text-slate-500">Student not found</div>;

  const { student, marks, attendance, prediction, summary, semesterTrend } = profileData;

  const marksChartData = marks.map((m) => ({
    subject: m.subject?.code || 'Subj',
    Internal: m.internalMarks,
    Assignment: m.assignmentMarks,
    Midterm: m.midtermMarks,
    Endterm: m.endtermMarks,
    Total: m.totalMarks,
  }));

  const attendanceChartData = attendance.map((a) => ({
    subject: a.subject?.code || 'Subj',
    percentage: a.percentage,
    attended: a.attendedClasses,
    total: a.totalClasses,
  }));

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students Directory
        </Link>
        <button
          onClick={handleRefreshPrediction}
          disabled={predicting}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${predicting ? 'animate-spin' : ''}`} />
          Re-run AI Model
        </button>
      </div>

      {/* STUDENT PROFILE HEADER */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden bg-gradient-to-r from-white via-white to-brand-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-brand-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-brand-500/20">
              {student.name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{student.name}</h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400">
                  {student.rollNo}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> {student.department?.name} ({student.department?.code})
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> Semester {student.semester} - Section {student.section}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cumulative CGPA</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">{student.cgpa.toFixed(2)}</h2>
            </div>
            <div className="p-2 border-l border-slate-200 dark:border-slate-800 pl-4">
              <RiskBadge level={prediction?.riskLevel || 'Low'} />
            </div>
          </div>
        </div>
      </div>

      {/* TOP 5 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Average Marks"
          value={`${summary?.averageMarks || 0}%`}
          subtitle="All semesters combined"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Overall Attendance"
          value={`${summary?.attendanceRate || 0}%`}
          subtitle="University standard: 75%"
          icon={CalendarCheck}
          color={summary?.attendanceRate >= 75 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Passed Subjects"
          value={summary?.passedSubjects || 0}
          subtitle={`Out of ${summary?.totalSubjects || 0} enrolled`}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Failed Subjects"
          value={summary?.failedSubjects || 0}
          subtitle="Active backlogs"
          icon={XCircle}
          color={summary?.failedSubjects > 0 ? 'rose' : 'blue'}
        />
        <StatCard
          title="Performance Status"
          value={summary?.status || 'Good'}
          subtitle="Academic standing"
          icon={GraduationCap}
          color="purple"
        />
      </div>

      {/* TABS NAVIGATION */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Charts' },
          { id: 'marks', label: `Subject Marks (${marks.length})` },
          { id: 'attendance', label: `Attendance Record (${attendance.length})` },
          { id: 'ai-prediction', label: 'AI Risk Advisory & Forecast' },
          { id: 'personal', label: 'Personal & Guardian Details' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: Marks breakdown by subject */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Marks by Subject Breakdown
              </h3>
              <p className="text-xs text-slate-400 mb-4">Internal, Midterm, Endterm evaluation stack</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marksChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
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
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="Internal" stackId="a" fill="#6366f1" />
                    <Bar dataKey="Assignment" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="Midterm" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="Endterm" stackId="a" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: Attendance by Subject */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Attendance by Subject (%)
              </h3>
              <p className="text-xs text-slate-400 mb-4">75% university eligibility line benchmark</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
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
                    <Bar dataKey="percentage" name="Attendance %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Semester Performance Trend Line Chart */}
          {semesterTrend.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Semester Performance Trajectory
              </h3>
              <p className="text-xs text-slate-400 mb-4">Historical semester score trend</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={semesterTrend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} />
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
                    <Line
                      type="monotone"
                      dataKey="avgPercentage"
                      name="Average Percentage"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: MARKS TABLE */}
      {activeTab === 'marks' && (
        <div className="glass-card overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Sem</th>
                  <th className="py-3 px-4 text-center">Internal (/20)</th>
                  <th className="py-3 px-4 text-center">Assign (/10)</th>
                  <th className="py-3 px-4 text-center">Midterm (/30)</th>
                  <th className="py-3 px-4 text-center">Endterm (/40)</th>
                  <th className="py-3 px-4 text-center">Total (/100)</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marks.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{m.subject?.name}</span>
                      <span className="font-mono text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                        {m.subject?.code} • {m.subject?.credits} Credits
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">Sem {m.semester}</td>
                    <td className="py-3.5 px-4 text-center font-medium">{m.internalMarks}</td>
                    <td className="py-3.5 px-4 text-center font-medium">{m.assignmentMarks}</td>
                    <td className="py-3.5 px-4 text-center font-medium">{m.midtermMarks}</td>
                    <td className="py-3.5 px-4 text-center font-medium">{m.endtermMarks}</td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-brand-600 dark:text-brand-400">
                      {m.totalMarks} ({m.percentage}%)
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <GradeBadge grade={m.grade} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          m.result === 'Pass'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        }`}
                      >
                        {m.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ATTENDANCE TABLE */}
      {activeTab === 'attendance' && (
        <div className="glass-card overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Total Classes</th>
                  <th className="py-3 px-4 text-center">Attended Classes</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendance.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{a.subject?.name}</span>
                      <span className="font-mono text-[10px] text-brand-600 font-semibold">{a.subject?.code}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">{a.totalClasses}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">{a.attendedClasses}</td>
                    <td className="py-3.5 px-4 text-center font-extrabold">{a.percentage}%</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === 'Safe'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : a.status === 'Warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: AI PREDICTION & RECOMMENDATIONS */}
      {activeTab === 'ai-prediction' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 bg-gradient-to-br from-brand-600 to-indigo-700 text-white">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
                  ML Model Forecast
                </span>
              </div>
              <h2 className="text-4xl font-black">{prediction?.predictedCGPA?.toFixed(2) || '8.50'}</h2>
              <p className="text-xs text-brand-100 mt-1">Forecasted Graduation CGPA (Predicted Grade: {prediction?.predictedGrade})</p>
              <div className="mt-6 pt-4 border-t border-brand-400/30 flex items-center justify-between text-xs">
                <span>Model: {prediction?.modelType}</span>
                <span className="font-bold">Accuracy: {prediction?.accuracyScore}%</span>
              </div>
            </div>

            <div className="glass-card p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passing Probability</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {prediction?.passProbability || 85}%
              </h3>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${prediction?.passProbability || 85}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Likelihood of passing current semester without backlogs</p>
            </div>

            <div className="glass-card p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">On-Time Graduation</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {prediction?.onTimeGraduationProbability || 90}%
              </h3>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${prediction?.onTimeGraduationProbability || 90}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Zero backlog graduation completion trajectory</p>
            </div>
          </div>

          {/* Identified Risk Factors */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Identified Risk Indicators & Drivers
            </h3>
            {prediction?.riskFactors?.length === 0 ? (
              <p className="text-xs text-slate-500">No critical academic risks detected for this student.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prediction?.riskFactors?.map((rf, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1 font-bold text-amber-900 dark:text-amber-200">
                      <span>{rf.factor}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                        {rf.severity} Severity
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{rf.impact}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personalized Action Plan */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-brand-500" />
              Automated AI Action Plan & Academic Advisory
            </h3>
            <div className="space-y-3">
              {prediction?.recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start justify-between gap-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{rec.action}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                      rec.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950'
                        : rec.priority === 'High'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950'
                        : 'bg-brand-100 text-brand-700 dark:bg-brand-950'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: PERSONAL & GUARDIAN */}
      {activeTab === 'personal' && (
        <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Personal Information</h3>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Enrollment Year:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{student.enrollmentYear}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Phone Number:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{student.phone || 'N/A'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Section:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">Section {student.section}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Previous CGPA:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{student.previousCgpa}</dd>
              </div>
              <div className="pt-2">
                <dt className="text-slate-400 mb-1.5">Technical Skills & Strengths:</dt>
                <div className="flex flex-wrap gap-1.5">
                  {student.skills?.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 font-semibold text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Guardian & Address</h3>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Guardian Name:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{student.guardian?.name || 'N/A'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Guardian Relation:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{student.guardian?.relation || 'Parent'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Guardian Contact:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{student.guardian?.phone || 'N/A'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">City / State:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {student.address?.city}, {student.address?.state} {student.address?.zipCode}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
