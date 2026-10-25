import api from './api';

export const academicService = {
  // Departments
  getDepartments: async () => {
    const res = await api.get('/departments');
    return res.data;
  },
  createDepartment: async (data) => {
    const res = await api.post('/departments', data);
    return res.data;
  },
  updateDepartment: async (id, data) => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },
  deleteDepartment: async (id) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },

  // Faculty
  getFaculties: async (params) => {
    const res = await api.get('/faculty', { params });
    return res.data;
  },
  createFaculty: async (data) => {
    const res = await api.post('/faculty', data);
    return res.data;
  },
  updateFaculty: async (id, data) => {
    const res = await api.put(`/faculty/${id}`, data);
    return res.data;
  },
  deleteFaculty: async (id) => {
    const res = await api.delete(`/faculty/${id}`);
    return res.data;
  },

  // Subjects
  getSubjects: async (params) => {
    const res = await api.get('/subjects', { params });
    return res.data;
  },
  createSubject: async (data) => {
    const res = await api.post('/subjects', data);
    return res.data;
  },
  updateSubject: async (id, data) => {
    const res = await api.put(`/subjects/${id}`, data);
    return res.data;
  },
  deleteSubject: async (id) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  },

  // Marks
  getMarks: async (params) => {
    const res = await api.get('/marks', { params });
    return res.data;
  },
  createMark: async (data) => {
    const res = await api.post('/marks', data);
    return res.data;
  },
  updateMark: async (id, data) => {
    const res = await api.put(`/marks/${id}`, data);
    return res.data;
  },
  deleteMark: async (id) => {
    const res = await api.delete(`/marks/${id}`);
    return res.data;
  },
  bulkUpsertMarks: async (data) => {
    const res = await api.post('/marks/bulk', data);
    return res.data;
  },

  // Attendance
  getAttendance: async (params) => {
    const res = await api.get('/attendance', { params });
    return res.data;
  },
  saveAttendance: async (data) => {
    const res = await api.post('/attendance', data);
    return res.data;
  },
  recordClassSession: async (data) => {
    const res = await api.post('/attendance/session', data);
    return res.data;
  },
};
