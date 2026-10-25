import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import { studentService } from '../../services/studentService';
import GradeBadge from '../../components/common/GradeBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { GraduationCap, Search, Plus, Edit2, Trash2, Filter, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarksManagement() {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSem, setSelectedSem] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMark, setCurrentMark] = useState(null);

  const [formData, setFormData] = useState({
    student: '',
    subject: '',
    semester: 5,
    internalMarks: 18,
    assignmentMarks: 9,
    midtermMarks: 26,
    endtermMarks: 35,
    remarks: 'Good performance',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [marksRes, stuRes, subRes] = await Promise.all([
        academicService.getMarks({
          search,
          semester: selectedSem !== 'all' ? selectedSem : undefined,
          subject: selectedSubject !== 'all' ? selectedSubject : undefined,
          result: selectedResult !== 'all' ? selectedResult : undefined,
        }),
        studentService.getStudents({ limit: 100 }),
        academicService.getSubjects(),
      ]);

      if (marksRes.success) setMarks(marksRes.data);
      if (stuRes.success) setStudents(stuRes.data);
      if (subRes.success) setSubjects(subRes.data);
    } catch (error) {
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSem, selectedSubject, selectedResult]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openAddModal = () => {
    setFormData({
      student: students[0]?._id || '',
      subject: subjects[0]?._id || '',
      semester: 5,
      internalMarks: 18,
      assignmentMarks: 9,
      midtermMarks: 26,
      endtermMarks: 35,
      remarks: 'Good continuous evaluation',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (m) => {
    setCurrentMark(m);
    setFormData({
      student: m.student?._id || m.student,
      subject: m.subject?._id || m.subject,
      semester: m.semester,
      internalMarks: m.internalMarks,
      assignmentMarks: m.assignmentMarks,
      midtermMarks: m.midtermMarks,
      endtermMarks: m.endtermMarks,
      remarks: m.remarks || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await academicService.createMark(formData);
      if (res.success) {
        toast.success(`Mark entry created: Total ${res.data.totalMarks} (${res.data.grade})`);
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save marks');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await academicService.updateMark(currentMark._id, formData);
      if (res.success) {
        toast.success(`Marks recalculated by backend: Grade ${res.data.grade}`);
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update marks');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await academicService.deleteMark(currentMark._id);
      if (res.success) {
        toast.success('Mark record deleted');
        setIsDeleteModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete mark record');
    }
  };

  // Preview live computed sum
  const liveTotal =
    Number(formData.internalMarks || 0) +
    Number(formData.assignmentMarks || 0) +
    Number(formData.midtermMarks || 0) +
    Number(formData.endtermMarks || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Academic Marks Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous assessments, midterms, finals & backend auto-grading
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Mark Record
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
              placeholder="Search student or subject..."
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
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="all">All Results</option>
            <option value="Pass">Pass Only</option>
            <option value="Fail">Fail Only</option>
          </select>
        </div>
      </div>

      {/* Marks Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching marks collection..." />
        ) : marks.length === 0 ? (
          <EmptyState
            title="No mark entries found"
            description="Add marks evaluation or reset filters."
            actionLabel="Add Mark Entry"
            onAction={openAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-3 text-center">Internal (/20)</th>
                  <th className="py-3 px-3 text-center">Assign (/10)</th>
                  <th className="py-3 px-3 text-center">Midterm (/30)</th>
                  <th className="py-3 px-3 text-center">Endterm (/40)</th>
                  <th className="py-3 px-3 text-center">Total (/100)</th>
                  <th className="py-3 px-3 text-center">%</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-center">Result</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marks.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{m.student?.name}</span>
                      <span className="font-mono text-[10px] text-brand-600 font-semibold">{m.student?.rollNo}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{m.subject?.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{m.subject?.code}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium">{m.internalMarks}</td>
                    <td className="py-3.5 px-3 text-center font-medium">{m.assignmentMarks}</td>
                    <td className="py-3.5 px-3 text-center font-medium">{m.midtermMarks}</td>
                    <td className="py-3.5 px-3 text-center font-medium">{m.endtermMarks}</td>
                    <td className="py-3.5 px-3 text-center font-black text-brand-600 dark:text-brand-400">
                      {m.totalMarks}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {m.percentage}%
                    </td>
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
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentMark(m);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Record Student Marks' : 'Edit Mark Evaluation'}
      >
        <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student *
              </label>
              <select
                required
                disabled={isEditModalOpen}
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject *
              </label>
              <select
                required
                disabled={isEditModalOpen}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Internal (/20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                required
                value={formData.internalMarks}
                onChange={(e) => setFormData({ ...formData, internalMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Assignment (/10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                required
                value={formData.assignmentMarks}
                onChange={(e) => setFormData({ ...formData, assignmentMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Midterm (/30)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                required
                value={formData.midtermMarks}
                onChange={(e) => setFormData({ ...formData, midtermMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Endterm (/40)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                required
                value={formData.endtermMarks}
                onChange={(e) => setFormData({ ...formData, endtermMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-brand-50 dark:bg-brand-950/50 rounded-xl flex items-center justify-between text-xs text-brand-900 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-900">
            <span className="flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> Computed Total: {liveTotal} / 100 ({liveTotal}%)
            </span>
            <span>Estimated Grade: {liveTotal >= 90 ? 'O' : liveTotal >= 80 ? 'A+' : liveTotal >= 70 ? 'A' : liveTotal >= 60 ? 'B+' : liveTotal >= 50 ? 'B' : liveTotal >= 40 ? 'C' : 'F'}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Remarks
            </label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Excellent presentation in assignments"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
            >
              Save Marks
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Mark Record"
        message="Are you sure you want to delete this evaluation entry?"
      />
    </div>
  );
}
