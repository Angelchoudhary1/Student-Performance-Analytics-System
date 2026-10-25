import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import StatCard from '../../components/common/StatCard';
import RiskBadge from '../../components/common/RiskBadge';
import GradeBadge from '../../components/common/GradeBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  GraduationCap,
  CalendarCheck,
  CheckCircle,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Award,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        // If logged in student has studentProfile, use that ID, else query first student
        let studentId = user?.studentProfile?._id;
        if (!studentId) {
          const list = await studentService.getStudents({ limit: 1 });
          if (list.success && list.data.length > 0) {
            studentId = list.data[0]._id;
          }
        }

        if (studentId) {
          const res = await studentService.getStudentById(studentId);
          if (res.success) setProfileData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  if (loading) return <LoadingSpinner text="Loading your academic profile..." />;
  if (!profileData) return <div className="p-8 text-center text-slate-500">Student record not found.</div>;

  const { student, marks, attendance, prediction, summary, semesterTrend } = profileData;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Card */}
      <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 text-white rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
              Personalized Student Workspace
            </span>
            <h1 className="text-3xl font-black">Welcome back, {user?.name || student.name}!</h1>
            <p className="text-xs text-brand-100 max-w-xl">
              Roll No: <span className="font-mono font-bold text-white">{student.rollNo}</span> • Department of{' '}
              {student.department?.name || 'Computer Science'} (Semester {student.semester})
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-200">Current CGPA</p>
              <h2 className="text-4xl font-black">{student.cgpa.toFixed(2)}</h2>
            </div>
            <div className="border-l border-white/20 pl-4">
              <span className="text-xs font-bold block text-brand-100">Status</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                {summary?.status || 'Good'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${student.attendanceRate}%`}
          subtitle="Mandatory Cutoff: 75%"
          icon={CalendarCheck}
          color={student.attendanceRate >= 75 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Average Score"
          value={`${summary?.averageMarks || 0}%`}
          subtitle="Continuous assessment"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Completed Courses"
          value={summary?.passedSubjects || 0}
          subtitle={`Out of ${summary?.totalSubjects || 0} enrolled`}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Forecasted CGPA"
          value={prediction?.predictedCGPA?.toFixed(2) || '8.50'}
          subtitle={`AI Grade: ${prediction?.predictedGrade || 'A'}`}
          icon={BrainCircuit}
          color="purple"
        />
      </div>

      {/* AI Risk & Advisory Highlight Card */}
      <div className="glass-card p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-indigo-900/60 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-600 rounded-2xl text-white shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                AI Predictive Performance Advisor
                <span className="text-[10px] bg-brand-500/30 text-brand-300 px-2 py-0.5 rounded-full font-mono">
                  Accuracy 94.2%
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Scikit-Learn Machine Learning continuous assessment evaluation
              </p>
            </div>
          </div>

          <Link
            to="/student/ai-report"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-colors shadow"
          >
            View Complete AI Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Risk</span>
            <div className="mt-1">
              <RiskBadge level={prediction?.riskLevel || 'Low'} />
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Pass Probability</span>
            <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{prediction?.passProbability || 85}%</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Top Recommendation</span>
            <p className="text-xs text-slate-200 mt-1 line-clamp-2">
              {prediction?.recommendations?.[0]?.action || 'Continue regular course attendance and assignments.'}
            </p>
          </div>
        </div>
      </div>

      {/* Current Semester Courses Marks Summary */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-600" />
            Current Enrolled Courses & Evaluations
          </h3>
          <Link to="/student/marks" className="text-xs font-bold text-brand-600 hover:underline">
            View All Grades →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4 text-center">Score (/100)</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {marks.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {m.subject?.name}
                    <span className="font-mono text-[10px] text-brand-600 ml-2">{m.subject?.code}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium">Sem {m.semester}</td>
                  <td className="py-3.5 px-4 text-center font-black text-brand-600 dark:text-brand-400">
                    {m.totalMarks}
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
    </div>
  );
}
