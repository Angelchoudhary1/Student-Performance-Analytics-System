import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  UserCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FacultyManagement() {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: 'Assistant Professor',
    specialization: '',
    experienceYears: 5,
    officeRoom: 'Block A, Room 204',
    assignedSubjects: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facRes, deptRes, subRes] = await Promise.all([
        academicService.getFaculties({ search, department: selectedDept !== 'all' ? selectedDept : undefined }),
        academicService.getDepartments(),
        academicService.getSubjects(),
      ]);

      if (facRes.success) setFaculties(facRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (subRes.success) setSubjects(subRes.data);
    } catch (error) {
      toast.error('Failed to load faculty records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openAddModal = () => {
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      department: departments[0]?._id || '',
      designation: 'Assistant Professor',
      specialization: 'Computer Science',
      experienceYears: 5,
      officeRoom: 'Block A, Room 204',
      assignedSubjects: [],
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (fac) => {
    setCurrentFaculty(fac);
    setFormData({
      employeeId: fac.employeeId,
      name: fac.name,
      email: fac.email,
      phone: fac.phone || '',
      department: fac.department?._id || fac.department || '',
      designation: fac.designation || 'Assistant Professor',
      specialization: fac.specialization || '',
      experienceYears: fac.experienceYears || 5,
      officeRoom: fac.officeRoom || '',
      assignedSubjects: fac.assignedSubjects ? fac.assignedSubjects.map((s) => s._id || s) : [],
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (fac) => {
    setCurrentFaculty(fac);
    setIsDeleteModalOpen(true);
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    try {
      const res = await academicService.createFaculty(formData);
      if (res.success) {
        toast.success('Faculty member added successfully!');
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add faculty member');
    }
  };

  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    try {
      const res = await academicService.updateFaculty(currentFaculty._id, formData);
      if (res.success) {
        toast.success('Faculty details updated!');
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update faculty');
    }
  };

  const handleDeleteFaculty = async () => {
    try {
      const res = await academicService.deleteFaculty(currentFaculty._id);
      if (res.success) {
        toast.success('Faculty member removed');
        setIsDeleteModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete faculty');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Faculty Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Teaching staff directory & course allocation
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Faculty
        </button>
      </div>

      {/* Filter bar */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <form onSubmit={handleSearch} className="relative sm:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty by name, employee ID, or email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Data Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Querying faculty collection..." />
        ) : faculties.length === 0 ? (
          <EmptyState
            title="No faculty members found"
            description="Add faculty records or reset search filters."
            actionLabel="Add Faculty"
            onAction={openAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Faculty Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Assigned Subjects</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {faculties.map((fac) => (
                  <tr key={fac._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {fac.employeeId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{fac.name}</span>
                      <span className="text-[11px] text-slate-400">{fac.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {fac.department?.code}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {fac.designation}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {fac.assignedSubjects?.length > 0 ? (
                          fac.assignedSubjects.map((s) => (
                            <span
                              key={s._id}
                              className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-mono text-[10px]"
                            >
                              {s.code}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(fac)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(fac)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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

      {/* ADD/EDIT MODAL */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add Faculty Member' : 'Edit Faculty Details'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={isAddModalOpen ? handleCreateFaculty : handleUpdateFaculty} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                required
                disabled={isEditModalOpen}
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="e.g. FAC010"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Ada Lovelace"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="faculty@college.edu"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Designation
              </label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Head of Department">Head of Department</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Distributed Systems & NoSQL"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assign Subjects
            </label>
            <select
              multiple
              value={formData.assignedSubjects}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                setFormData({ ...formData, assignedSubjects: selected });
              }}
              className="w-full h-28 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name} (Sem {s.semester})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">Hold Ctrl (Cmd) to select multiple courses</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
            >
              Save Details
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteFaculty}
        title="Remove Faculty Record"
        message={`Are you sure you want to remove ${currentFaculty?.name}?`}
      />
    </div>
  );
}
