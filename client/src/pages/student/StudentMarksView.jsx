import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import GradeBadge from '../../components/common/GradeBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { GraduationCap, Award, BookOpen, CheckCircle } from 'lucide-react';

export default function StudentMarksView() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
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

    fetchMarks();
  }, [user]);

  if (loading) return <LoadingSpinner text="Fetching your academic marks..." />;

  const { marks = [], student = {} } = profileData || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            My Course Marks & Transcripts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed breakdown of Internal, Assignment, Midterm, and Endterm scores
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-3 text-center">Semester</th>
                <th className="py-3 px-3 text-center">Internal (/20)</th>
                <th className="py-3 px-3 text-center">Assign (/10)</th>
                <th className="py-3 px-3 text-center">Midterm (/30)</th>
                <th className="py-3 px-3 text-center">Endterm (/40)</th>
                <th className="py-3 px-3 text-center">Total (/100)</th>
                <th className="py-3 px-3 text-center">%</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {marks.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {m.subject?.name}
                    <span className="font-mono text-[10px] text-brand-600 block">{m.subject?.code}</span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-medium">Sem {m.semester}</td>
                  <td className="py-3.5 px-3 text-center font-medium">{m.internalMarks}</td>
                  <td className="py-3.5 px-3 text-center font-medium">{m.assignmentMarks}</td>
                  <td className="py-3.5 px-3 text-center font-medium">{m.midtermMarks}</td>
                  <td className="py-3.5 px-3 text-center font-medium">{m.endtermMarks}</td>
                  <td className="py-3.5 px-3 text-center font-black text-brand-600 dark:text-brand-400">
                    {m.totalMarks}
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold">{m.percentage}%</td>
                  <td className="py-3.5 px-3 text-center">
                    <GradeBadge grade={m.grade} />
                  </td>
                  <td className="py-3.5 px-3 text-center">
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
