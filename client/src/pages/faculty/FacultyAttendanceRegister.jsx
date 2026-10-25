import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import { studentService } from '../../services/studentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CalendarCheck2, Check, X, Clock, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FacultyAttendanceRegister() {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('Course Lecture & Technical Session');
  const [studentStates, setStudentStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        }

        if (stuRes.success) {
          setStudents(stuRes.data);
          const states = {};
          stuRes.data.forEach((s) => {
            states[s._id] = 'Present';
          });
          setStudentStates(states);
        }
      } catch (err) {
        toast.error('Failed to load register');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setStudentStates(updated);
    toast.success(`Marked all students as ${status}`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const sub = subjects.find((s) => s._id === selectedSubject);
      const attendances = Object.keys(studentStates).map((studentId) => ({
        studentId,
        status: studentStates[studentId],
      }));

      const res = await academicService.recordClassSession({
        subjectId: selectedSubject,
        semester: sub?.semester || 5,
        date,
        topic,
        attendances,
      });

      if (res.success) {
        toast.success('Daily attendance register recorded in MongoDB!');
      }
    } catch (error) {
      toast.error('Failed to submit attendance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading attendance register..." />;

  const presentCount = Object.values(studentStates).filter((s) => s === 'Present').length;
  const absentCount = Object.values(studentStates).filter((s) => s === 'Absent').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Faculty Attendance Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log daily lecture & laboratory attendance sessions into MongoDB
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          Save Class Register
        </button>
      </div>

      {/* Course & Date Picker */}
      <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Course</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
          >
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.code} - {sub.name} (Sem {sub.semester})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Session Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lecture Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
          />
        </div>
      </div>

      {/* Fast Action Buttons & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-4">
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-emerald-600">Present: {presentCount}</span>
          <span className="text-rose-600">Absent: {absentCount}</span>
          <span className="text-slate-400">Total: {students.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="px-3 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-lg text-xs font-bold border border-rose-200"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Register List */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {students.map((st) => (
            <div
              key={st._id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</span>
                <span className="font-mono text-xs text-brand-600 font-semibold ml-2">{st.rollNo}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Overall Attendance Rate: {st.attendanceRate}%</p>
              </div>

              <div className="flex items-center gap-2">
                {['Present', 'Absent', 'Late'].map((stt) => (
                  <button
                    key={stt}
                    type="button"
                    onClick={() => setStudentStates((prev) => ({ ...prev, [st._id]: stt }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      studentStates[st._id] === stt
                        ? stt === 'Present'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : stt === 'Absent'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {stt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
