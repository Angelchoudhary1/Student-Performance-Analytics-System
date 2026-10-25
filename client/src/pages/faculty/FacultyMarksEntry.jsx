import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import { studentService } from '../../services/studentService';
import GradeBadge from '../../components/common/GradeBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ClipboardList, Save, CheckCircle, Calculator, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FacultyMarksEntry() {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSem, setSelectedSem] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Grid rows: studentId -> { internal, assignment, midterm, endterm, remarks }
  const [markRows, setMarkRows] = useState({});

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [subRes, stuRes] = await Promise.all([
          academicService.getSubjects(),
          studentService.getStudents({ limit: 100 }),
        ]);

        if (subRes.success && subRes.data.length > 0) {
          setSubjects(subRes.data);
          setSelectedSubject(subRes.data[0]._id);
          setSelectedSem(subRes.data[0].semester);
        }

        if (stuRes.success) {
          setStudents(stuRes.data);
          // initialize rows
          const initial = {};
          stuRes.data.forEach((st) => {
            initial[st._id] = {
              internalMarks: 16,
              assignmentMarks: 8,
              midtermMarks: 24,
              endtermMarks: 32,
              remarks: 'Satisfactory',
            };
          });
          setMarkRows(initial);
        }
      } catch (err) {
        toast.error('Failed to initialize marks sheet');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleScoreChange = (studentId, field, val) => {
    setMarkRows((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: Number(val),
      },
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const entries = Object.keys(markRows).map((studentId) => ({
        studentId,
        internalMarks: markRows[studentId].internalMarks || 0,
        assignmentMarks: markRows[studentId].assignmentMarks || 0,
        midtermMarks: markRows[studentId].midtermMarks || 0,
        endtermMarks: markRows[studentId].endtermMarks || 0,
        remarks: markRows[studentId].remarks || '',
      }));

      const res = await academicService.bulkUpsertMarks({
        subjectId: selectedSubject,
        semester: selectedSem,
        entries,
      });

      if (res.success) {
        toast.success(res.message || 'Marks successfully saved to MongoDB and CGPAs recalculated!');
      }
    } catch (error) {
      toast.error('Failed to save grading sheet');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading grade sheet..." />;

  const currentCourse = subjects.find((s) => s._id === selectedSubject);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Faculty Marks Grading Sheet
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spreadsheet-style continuous evaluation score entry with automatic MongoDB upsert
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          Save & Calculate All Grades
        </button>
      </div>

      {/* Course Selector Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Subject Course:</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              const sub = subjects.find((s) => s._id === e.target.value);
              setSelectedSubject(e.target.value);
              if (sub) setSelectedSem(sub.semester);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
          >
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.code} - {sub.name} (Sem {sub.semester})
              </option>
            ))}
          </select>
        </div>

        {currentCourse && (
          <div className="text-xs text-slate-500 flex items-center gap-4">
            <span>Credits: <strong>{currentCourse.credits}</strong></span>
            <span>Semester: <strong>Sem {currentCourse.semester}</strong></span>
            <span>Batch: <strong>{students.length} Students</strong></span>
          </div>
        )}
      </div>

      {/* Spreadsheet Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3 text-center w-28">Internal (/20)</th>
                <th className="py-3 px-3 text-center w-28">Assign (/10)</th>
                <th className="py-3 px-3 text-center w-28">Midterm (/30)</th>
                <th className="py-3 px-3 text-center w-28">Endterm (/40)</th>
                <th className="py-3 px-3 text-center w-28">Total (/100)</th>
                <th className="py-3 px-3 text-center w-24">Estimated Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((st) => {
                const row = markRows[st._id] || {};
                const total =
                  (row.internalMarks || 0) +
                  (row.assignmentMarks || 0) +
                  (row.midtermMarks || 0) +
                  (row.endtermMarks || 0);

                const getGrade = (score) => {
                  if (score >= 90) return 'O';
                  if (score >= 80) return 'A+';
                  if (score >= 70) return 'A';
                  if (score >= 60) return 'B+';
                  if (score >= 50) return 'B';
                  if (score >= 40) return 'C';
                  return 'F';
                };

                return (
                  <tr key={st._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {st.rollNo}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{st.name}</td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={row.internalMarks !== undefined ? row.internalMarks : 16}
                        onChange={(e) => handleScoreChange(st._id, 'internalMarks', e.target.value)}
                        className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={row.assignmentMarks !== undefined ? row.assignmentMarks : 8}
                        onChange={(e) => handleScoreChange(st._id, 'assignmentMarks', e.target.value)}
                        className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={row.midtermMarks !== undefined ? row.midtermMarks : 24}
                        onChange={(e) => handleScoreChange(st._id, 'midtermMarks', e.target.value)}
                        className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={row.endtermMarks !== undefined ? row.endtermMarks : 32}
                        onChange={(e) => handleScoreChange(st._id, 'endtermMarks', e.target.value)}
                        className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-brand-600 dark:text-brand-400">
                      {total}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <GradeBadge grade={getGrade(total)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
