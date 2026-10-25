import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import { studentService } from '../../services/studentService';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { CalendarCheck2, Search, Plus, Filter, Check, X, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendanceManagement() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSem, setSelectedSem] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);

  // Daily Session Form state
  const [sessionData, setSessionData] = useState({
    subjectId: '',
    semester: 5,
    date: new Date().toISOString().split('T')[0],
    topic: 'Continuous Lecture Session',
    studentStates: {}, // studentId: 'Present' | 'Absent' | 'Late'
  });

  // Summary Edit Form state
  const [editFormData, setEditFormData] = useState({
    totalClasses: 45,
    attendedClasses: 40,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attRes, stuRes, subRes] = await Promise.all([
        academicService.getAttendance({
          search,
          semester: selectedSem !== 'all' ? selectedSem : undefined,
          subject: selectedSubject !== 'all' ? selectedSubject : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }),
        studentService.getStudents({ limit: 100 }),
        academicService.getSubjects(),
      ]);

      if (attRes.success) setAttendanceList(attRes.data);
      if (stuRes.success) setStudents(stuRes.data);
      if (subRes.success) {
        setSubjects(subRes.data);
        if (subRes.data.length > 0 && !sessionData.subjectId) {
          setSessionData((prev) => ({ ...prev, subjectId: subRes.data[0]._id }));
        }
      }
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSem, selectedSubject, selectedStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openSessionModal = () => {
    const states = {};
    students.forEach((s) => {
      states[s._id] = 'Present';
    });
    setSessionData({
      subjectId: subjects[0]?._id || '',
      semester: 5,
      date: new Date().toISOString().split('T')[0],
      topic: 'Lecture & Lab Demonstration',
      studentStates: states,
    });
    setIsSessionModalOpen(true);
  };

  const openEditModal = (att) => {
    setCurrentAttendance(att);
    setEditFormData({
      totalClasses: att.totalClasses,
      attendedClasses: att.attendedClasses,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveSummary = async (e) => {
    e.preventDefault();
    try {
      const res = await academicService.saveAttendance({
        student: currentAttendance.student?._id || currentAttendance.student,
        subject: currentAttendance.subject?._id || currentAttendance.subject,
        semester: currentAttendance.semester,
        totalClasses: editFormData.totalClasses,
        attendedClasses: editFormData.attendedClasses,
      });
      if (res.success) {
        toast.success(`Attendance updated: ${res.data.percentage}% (${res.data.status})`);
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const handleRecordSession = async (e) => {
    e.preventDefault();
    try {
      const attendances = Object.keys(sessionData.studentStates).map((studentId) => ({
        studentId,
        status: sessionData.studentStates[studentId],
      }));

      const res = await academicService.recordClassSession({
        subjectId: sessionData.subjectId,
        semester: sessionData.semester,
        date: sessionData.date,
        topic: sessionData.topic,
        attendances,
      });

      if (res.success) {
        toast.success(res.message || 'Class session marked successfully');
        setIsSessionModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to record class session');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Attendance Tracking & Records
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Class session registers, safe threshold monitors, and risk triggers
          </p>
        </div>

        <button
          onClick={openSessionModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Mark Class Session
        </button>
      </div>

      {/* Filter bar */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or course..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="Safe">Safe (≥75%)</option>
            <option value="Warning">Warning (65%-74%)</option>
            <option value="Critical">Critical (&lt;65%)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching attendance records..." />
        ) : attendanceList.length === 0 ? (
          <EmptyState
            title="No attendance records found"
            description="Log class attendance sessions to populate registers."
            actionLabel="Mark Session"
            onAction={openSessionModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Semester</th>
                  <th className="py-3 px-4 text-center">Attended / Total</th>
                  <th className="py-3 px-4 text-center">Attendance %</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceList.map((att) => (
                  <tr key={att._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{att.student?.name}</span>
                      <span className="font-mono text-[10px] text-brand-600 font-semibold">{att.student?.rollNo}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{att.subject?.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{att.subject?.code}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">Sem {att.semester}</td>
                    <td className="py-3.5 px-4 text-center font-semibold">
                      <span className="text-emerald-600">{att.attendedClasses}</span> / {att.totalClasses}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-black text-xs text-slate-900 dark:text-white">{att.percentage}%</span>
                        <div className="w-16 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              att.percentage >= 75 ? 'bg-emerald-500' : att.percentage >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, att.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          att.status === 'Safe'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : att.status === 'Warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(att)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Attendance Summary"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MARK DAILY CLASS SESSION MODAL */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Mark Daily Class Session Attendance"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleRecordSession} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject Course *
              </label>
              <select
                required
                value={sessionData.subjectId}
                onChange={(e) => setSessionData({ ...sessionData, subjectId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={sessionData.date}
                onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lecture Topic
              </label>
              <input
                type="text"
                value={sessionData.topic}
                onChange={(e) => setSessionData({ ...sessionData, topic: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
              Class Attendance Register ({students.length} Students)
            </h4>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
              {students.map((st) => (
                <div key={st._id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{st.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 ml-2">{st.rollNo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {['Present', 'Absent', 'Late'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setSessionData((prev) => ({
                            ...prev,
                            studentStates: { ...prev.studentStates, [st._id]: status },
                          }))
                        }
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          sessionData.studentStates[st._id] === status
                            ? status === 'Present'
                              ? 'bg-emerald-600 text-white'
                              : status === 'Absent'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSessionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
            >
              Submit Daily Attendance
            </button>
          </div>
        </form>
      </Modal>

      {/* ADJUST SUMMARY MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Adjust Aggregate Attendance"
      >
        <form onSubmit={handleSaveSummary} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Total Classes
              </label>
              <input
                type="number"
                min="1"
                required
                value={editFormData.totalClasses}
                onChange={(e) => setEditFormData({ ...editFormData, totalClasses: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Attended Classes
              </label>
              <input
                type="number"
                min="0"
                required
                value={editFormData.attendedClasses}
                onChange={(e) => setEditFormData({ ...editFormData, attendedClasses: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
            >
              Update Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
