import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CalendarCheck2, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function StudentAttendanceView() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        let studentId = user?.studentProfile?._id;
        if (!studentId) {
          const list = await studentService.getStudents({ limit: 1 });
          if (list.success && list.data.length > 0) studentId = list.data[0]._id;
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

    fetchAttendance();
  }, [user]);

  if (loading) return <LoadingSpinner text="Fetching attendance records..." />;

  const { attendance = [], student = {} } = profileData || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          My Attendance Records & Health Meter
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Subject-wise attendance tracking and examination eligibility calculator
        </p>
      </div>

      {/* Aggregate Banner */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">Aggregate Institutional Attendance</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{student.attendanceRate}%</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {student.attendanceRate >= 75
              ? '✅ You meet the university minimum 75% examination eligibility requirement.'
              : '⚠️ Warning: Attendance is below 75%. Please attend upcoming lectures to regain eligibility.'}
          </p>
        </div>

        <div className="w-full sm:w-64 bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              student.attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, student.attendanceRate)}%` }}
          />
        </div>
      </div>

      {/* Subject-Wise Attendance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attendance.map((att) => (
          <div key={att._id} className="glass-card p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {att.subject?.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    att.status === 'Safe'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {att.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{att.subject?.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Semester {att.semester}</p>

              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Attendance</span>
                  <span className="font-black text-brand-600 dark:text-brand-400">{att.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      att.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, att.percentage)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
              <span>Attended: {att.attendedClasses}</span>
              <span>Total Classes: {att.totalClasses}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
