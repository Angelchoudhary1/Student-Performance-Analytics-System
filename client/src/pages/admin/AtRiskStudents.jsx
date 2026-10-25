import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { academicService } from '../../services/academicService';
import RiskBadge from '../../components/common/RiskBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Mail,
  Phone,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AtRiskStudents() {
  const [atRiskList, setAtRiskList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [severity, setSeverity] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [riskRes, deptRes] = await Promise.all([
        analyticsService.getAtRiskStudents({
          severity: severity !== 'all' ? severity : undefined,
          department: selectedDept !== 'all' ? selectedDept : undefined,
        }),
        academicService.getDepartments(),
      ]);

      if (riskRes.success) setAtRiskList(riskRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (error) {
      toast.error('Failed to run at-risk detection pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [severity, selectedDept]);

  const filtered = atRiskList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendIntervention = (studentName) => {
    toast.success(`Academic advisory alert dispatched for ${studentName}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          At-Risk Students Early Warning System
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
            Multi-Factor Risk
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Proactive student dropout & failure prevention powered by MongoDB Aggregations & AI Inference
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All At-Risk' },
            { id: 'Critical', label: 'Critical Risk' },
            { id: 'High', label: 'High Risk' },
            { id: 'Moderate', label: 'Moderate Risk' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSeverity(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                severity === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name/roll..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <option value="all">All Depts</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Executing at-risk identification pipeline..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No at-risk students detected"
            description="All active students currently meet minimum GPA and attendance thresholds."
            icon={CheckCircle}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">CGPA</th>
                  <th className="py-3 px-4 text-center">Attendance</th>
                  <th className="py-3 px-4 text-center">Backlogs</th>
                  <th className="py-3 px-4 text-center">Risk Category</th>
                  <th className="py-3 px-4">Key Risk Factors</th>
                  <th className="py-3 px-4 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/admin/students/${st._id}`}
                        className="font-bold text-slate-900 dark:text-white hover:underline block"
                      >
                        {st.name}
                      </Link>
                      <span className="font-mono text-[10px] text-slate-400">{st.rollNo}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {st.departmentCode} (Sem {st.semester})
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-rose-600">
                      {st.cgpa.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span
                        className={
                          st.attendanceRate < 65
                            ? 'text-rose-600'
                            : st.attendanceRate < 75
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {st.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded font-black text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {st.backlogs} Arrears
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <RiskBadge level={st.riskCategory} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        {st.attendanceRate < 75 && (
                          <span className="inline-block text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950 px-1.5 py-0.5 rounded mr-1">
                            Attendance Deficit ({st.attendanceRate}%)
                          </span>
                        )}
                        {st.cgpa < 6.0 && (
                          <span className="inline-block text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950 px-1.5 py-0.5 rounded mr-1">
                            Low CGPA ({st.cgpa})
                          </span>
                        )}
                        {st.backlogs > 0 && (
                          <span className="inline-block text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                            {st.backlogs} Backlog(s)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSendIntervention(st.name)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-bold transition-colors"
                      >
                        Notify Advisor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
