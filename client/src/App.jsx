import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsManagement from './pages/admin/StudentsManagement';
import StudentProfile from './pages/admin/StudentProfile';
import FacultyManagement from './pages/admin/FacultyManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import MarksManagement from './pages/admin/MarksManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import AnalyticsHub from './pages/admin/AnalyticsHub';
import SmartRankings from './pages/admin/SmartRankings';
import AtRiskStudents from './pages/admin/AtRiskStudents';
import PredictionsStudio from './pages/admin/PredictionsStudio';
import DatabaseInsights from './pages/admin/DatabaseInsights';
import SettingsPage from './pages/admin/SettingsPage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyMarksEntry from './pages/faculty/FacultyMarksEntry';
import FacultyAttendanceRegister from './pages/faculty/FacultyAttendanceRegister';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMarksView from './pages/student/StudentMarksView';
import StudentAttendanceView from './pages/student/StudentAttendanceView';
import StudentAIReport from './pages/student/StudentAIReport';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner text="Authenticating session..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to user's assigned default portal
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e293b',
                color: '#fff',
                fontSize: '12px',
                borderRadius: '10px',
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Application Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Admin Portal Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentsManagement />} />
              <Route path="/admin/students/:id" element={<StudentProfile />} />
              <Route path="/admin/faculty" element={<FacultyManagement />} />
              <Route path="/admin/departments" element={<DepartmentManagement />} />
              <Route path="/admin/subjects" element={<SubjectManagement />} />
              <Route path="/admin/marks" element={<MarksManagement />} />
              <Route path="/admin/attendance" element={<AttendanceManagement />} />
              <Route path="/admin/analytics" element={<AnalyticsHub />} />
              <Route path="/admin/rankings" element={<SmartRankings />} />
              <Route path="/admin/at-risk" element={<AtRiskStudents />} />
              <Route path="/admin/predictions" element={<PredictionsStudio />} />
              <Route path="/admin/db-insights" element={<DatabaseInsights />} />
              <Route path="/admin/settings" element={<SettingsPage />} />

              {/* Faculty Portal Routes */}
              <Route path="/faculty" element={<FacultyDashboard />} />
              <Route path="/faculty/marks" element={<FacultyMarksEntry />} />
              <Route path="/faculty/attendance" element={<FacultyAttendanceRegister />} />

              {/* Student Portal Routes */}
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/marks" element={<StudentMarksView />} />
              <Route path="/student/attendance" element={<StudentAttendanceView />} />
              <Route path="/student/ai-report" element={<StudentAIReport />} />
            </Route>

            {/* Fallback wildcard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
