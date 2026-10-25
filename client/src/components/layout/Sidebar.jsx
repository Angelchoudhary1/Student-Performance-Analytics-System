import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  BookOpen,
  GraduationCap,
  CalendarCheck2,
  BarChart3,
  Trophy,
  AlertOctagon,
  Sparkles,
  Database,
  Settings,
  LogOut,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  BrainCircuit,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Faculty', path: '/admin/faculty', icon: UserCheck },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { label: 'Marks', path: '/admin/marks', icon: GraduationCap },
    { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck2 },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Rankings', path: '/admin/rankings', icon: Trophy },
    { label: 'At-Risk Students', path: '/admin/at-risk', icon: AlertOctagon, badge: 'Alerts' },
    { label: 'AI Predictions', path: '/admin/predictions', icon: Sparkles, badge: 'ML' },
    { label: 'Database Insights', path: '/admin/db-insights', icon: Database, badge: 'MongoDB' },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const facultyLinks = [
    { label: 'Faculty Dashboard', path: '/faculty', icon: LayoutDashboard, exact: true },
    { label: 'Marks Grading Sheet', path: '/faculty/marks', icon: ClipboardList },
    { label: 'Attendance Register', path: '/faculty/attendance', icon: CalendarCheck2 },
    { label: 'Student Directory', path: '/admin/students', icon: Users },
    { label: 'Academic Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'AI Risk Advisory', path: '/admin/at-risk', icon: Sparkles },
  ];

  const studentLinks = [
    { label: 'My Academic Portal', path: '/student', icon: LayoutDashboard, exact: true },
    { label: 'Course Marks & Grades', path: '/student/marks', icon: GraduationCap },
    { label: 'Attendance History', path: '/student/attendance', icon: CheckCircle2 },
    { label: 'AI Predictive Advisory', path: '/student/ai-report', icon: BrainCircuit, badge: 'AI' },
    { label: 'Leaderboard', path: '/admin/rankings', icon: Trophy },
  ];

  let links = adminLinks;
  if (user?.role === 'faculty') links = facultyLinks;
  if (user?.role === 'student') links = studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar navigation drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-500 text-white rounded-xl shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              SPP Analytics
            </h2>
            <p className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
              MongoDB & AI System
            </p>
          </div>
        </div>

        {/* Links Navigation */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {user?.role ? `${user.role} workspace` : 'Navigation'}
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.exact}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                    </div>

                    {link.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : link.badge === 'Alerts'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
