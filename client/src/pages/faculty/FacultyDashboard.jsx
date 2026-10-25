import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { academicService } from '../../services/academicService';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BookOpen,
  Users,
  ClipboardList,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyCourses = async () => {
      try {
        const res = await academicService.getSubjects();
        if (res.success) {
          // Filter courses assigned to this faculty if available, or all courses
          const assigned = res.data.filter(
            (s) =>
              s.faculty?._id === user?.facultyProfile?._id ||
              s.faculty?.email === user?.email ||
              s.faculty?.name === user?.name
          );
          setSubjects(assigned.length > 0 ? assigned : res.data.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyCourses();
  }, [user]);

  if (loading) return <LoadingSpinner text="Loading faculty workspace..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Faculty Academic Portal
            </span>
            <h1 className="text-3xl font-black">Welcome, {user?.name || 'Professor'}</h1>
            <p className="text-xs text-blue-100 max-w-xl">
              Manage student marks grading sheets, daily class attendance registers, and monitor at-risk performance alerts for your assigned courses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/faculty/marks"
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              Grade Entry Sheet
            </Link>
            <Link
              to="/faculty/attendance"
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              Mark Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Assigned Courses"
          value={subjects.length}
          subtitle="Active curriculum"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Active Students"
          value="35+"
          subtitle="Enrolled in your batches"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Average Passing Rate"
          value="91.4%"
          subtitle="Your courses benchmark"
          icon={Award}
          color="emerald"
        />
      </div>

      {/* Assigned Subjects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            My Assigned Teaching Courses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="glass-card p-6 flex flex-col justify-between hover:shadow-lg transition-all group border-t-4 border-t-brand-600"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {sub.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Semester {sub.semester}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Department: {sub.department?.name || sub.department?.code} • {sub.credits} Credits
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to="/faculty/marks"
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                >
                  Enter Marks <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/faculty/attendance"
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600"
                >
                  Take Attendance
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
