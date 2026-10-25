import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  Sparkles,
  Database,
  LineChart,
  Users,
  AlertTriangle,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';

export default function LandingPage() {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    const email =
      role === 'admin'
        ? 'admin@college.edu'
        : role === 'faculty'
        ? 'faculty@college.edu'
        : 'student@college.edu';

    await login(email, 'password123', role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'faculty') navigate('/faculty');
    else navigate('/student');
  };

  const features = [
    {
      title: 'Student Management',
      description: 'Comprehensive student directory with full profiles, multi-semester performance trends, and attendance logs.',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Performance Analytics',
      description: 'Real-time multi-dimensional aggregation of semester scores, credit averages, and continuous assessment metrics.',
      icon: LineChart,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: 'Attendance Tracking',
      description: 'Automated attendance registers with real-time percentage gauges, risk thresholds, and absent tracking.',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Smart Rankings',
      description: 'Dynamic leaderboards powered by MongoDB window functions computing overall, departmental, and semester ranks.',
      icon: Trophy,
      color: 'from-amber-500 to-yellow-600',
    },
    {
      title: 'At-Risk Detection',
      description: 'Automated multi-factor risk detection identifying students needing immediate academic intervention.',
      icon: AlertTriangle,
      color: 'from-rose-500 to-red-600',
    },
    {
      title: 'AI Prediction',
      description: 'Scikit-Learn Random Forest and Gradient Boosting models forecasting final CGPA and graduation probability.',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'MongoDB Analytics',
      description: 'High-performance aggregation pipelines ($facet, $bucket, $setWindowFields) and live index metrics inspection.',
      icon: Database,
      color: 'from-emerald-600 to-green-700',
    },
  ];

  const technologies = [
    { name: 'React.js', role: 'Frontend SPA', badge: 'v18.3' },
    { name: 'Vite', role: 'Next-Gen Bundler', badge: 'Fast' },
    { name: 'Tailwind CSS', role: 'Styling & Dark Mode', badge: 'v3.4' },
    { name: 'Node.js', role: 'Backend Runtime', badge: 'Async' },
    { name: 'Express.js', role: 'REST API Engine', badge: 'v4.19' },
    { name: 'MongoDB', role: 'Document Database', badge: 'Aggregation' },
    { name: 'Mongoose', role: 'Schema & Indexing', badge: 'v8.3' },
    { name: 'Python', role: 'ML Compute Engine', badge: 'v3.11+' },
    { name: 'Scikit-learn', role: 'Random Forest AI', badge: 'Predictive' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Student Data',
      desc: 'Demographics, marks, assessments & daily attendance collected.',
      icon: Users,
    },
    {
      step: '02',
      title: 'MongoDB',
      desc: 'Stored with compound indexes and high-speed aggregation pipelines.',
      icon: Database,
    },
    {
      step: '03',
      title: 'Analytics',
      desc: 'Real-time computation of KPIs, grade distributions & smart ranks.',
      icon: LineChart,
    },
    {
      step: '04',
      title: 'AI Prediction',
      desc: 'Scikit-Learn models evaluate risk level and forecast outcomes.',
      icon: Sparkles,
    },
    {
      step: '05',
      title: 'Academic Insights',
      desc: 'Actionable intervention plans delivered to faculty and students.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 glass-header">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Smart Student Performance
              </span>
              <span className="block text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                Predictive Analytics System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/student'}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/20 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Next-Gen Academic Intelligence & NoSQL Architecture
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Smart Student Performance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-400">Predictive Analytics</span>
            </h1>

            <p className="text-base md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Transform academic data into actionable insights with MongoDB-powered analytics and predictive intelligence.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all hover:scale-[1.02]"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-bold transition-colors"
              >
                Login
              </Link>
              <a
                href="#features"
                className="px-6 py-3.5 text-brand-600 dark:text-brand-400 hover:underline font-semibold text-sm"
              >
                Explore Features ↓
              </a>
            </div>

            {/* Quick 1-Click Interactive Demo Access */}
            <div className="pt-8 flex flex-col items-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Live Interactive Role Demos
              </p>
              <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <button
                  onClick={() => handleQuickDemo('admin')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 transition-colors"
                >
                  🚀 Demo as Admin
                </button>
                <button
                  onClick={() => handleQuickDemo('faculty')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 transition-colors"
                >
                  👨‍🏫 Demo as Faculty
                </button>
                <button
                  onClick={() => handleQuickDemo('student')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 transition-colors"
                >
                  🎓 Demo as Student
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
              End-to-End Pipeline
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="glass-card p-5 relative flex flex-col items-center text-center group hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                >
                  <span className="text-xs font-black text-brand-500 mb-2">{s.step}</span>
                  <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
            Complete Capability Matrix
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Enterprise Academic Intelligence
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Engineered specifically for academic institutions to eliminate student dropouts and boost institutional GPA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="glass-card p-6 hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TECHNOLOGY STACK SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
              Built With Modern Stack
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Technology Architecture
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {technologies.map((t) => (
              <div
                key={t.name}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {t.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <GraduationCap className="w-6 h-6 text-brand-400" />
              <span className="font-bold text-base">Smart Student Analytics</span>
            </div>
            <p className="text-xs text-slate-400">
              A comprehensive NoSQL and MongoDB course final project showcasing document modeling, high-throughput aggregation, indexing, and Python Scikit-Learn AI.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Course Topics</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>MongoDB Aggregation Pipelines</li>
              <li>Compound & Text Indexing</li>
              <li>Document Schema Relationships</li>
              <li>Scikit-Learn Predictive Modeling</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Contact & Support</h4>
            <p className="text-xs text-slate-400">Department of Computer Science & Engineering</p>
            <p className="text-xs text-slate-400 mt-1">support@college.edu</p>
            <p className="text-xs text-slate-500 mt-4">
              © {new Date().getFullYear()} Smart Student Performance & Predictive Analytics System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
