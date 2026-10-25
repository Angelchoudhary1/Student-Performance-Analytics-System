import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { academicService } from '../../services/academicService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Trophy, Medal, Award, Search, Filter, ArrowUpRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SmartRankings() {
  const [rankings, setRankings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedSem, setSelectedSem] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rankRes, deptRes] = await Promise.all([
        analyticsService.getRankings({
          department: selectedDept !== 'all' ? selectedDept : undefined,
          semester: selectedSem !== 'all' ? selectedSem : undefined,
        }),
        academicService.getDepartments(),
      ]);

      if (rankRes.success) setRankings(rankRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (error) {
      toast.error('Failed to execute smart rankings pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, selectedSem]);

  const filteredRankings = rankings.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-black text-xs border border-amber-300 dark:border-amber-800 shadow-xs">
          🥇 Gold (#1)
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200 font-black text-xs border border-slate-300 dark:border-slate-700 shadow-xs">
          🥈 Silver (#2)
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 font-black text-xs border border-amber-200 dark:border-amber-900 shadow-xs">
          🥉 Bronze (#3)
        </span>
      );
    }
    return <span className="font-bold text-slate-500 font-mono text-xs">#{rank}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Smart Student Rankings
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800">
            $setWindowFields
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Dynamic dense ranking partitioned by Department and Overall institution in MongoDB
        </p>
      </div>

      {/* Podium Cards for Top 3 */}
      {filteredRankings.length >= 3 && !search && selectedDept === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Rank 2 */}
          <div className="glass-card p-6 flex flex-col items-center text-center order-2 md:order-1 border-t-4 border-t-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xl mb-3">
              🥈
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rank #2 Overall</span>
            <Link
              to={`/admin/students/${filteredRankings[1]._id}`}
              className="text-base font-bold text-slate-900 dark:text-white mt-1 hover:underline"
            >
              {filteredRankings[1].name}
            </Link>
            <p className="text-xs font-mono text-slate-400">{filteredRankings[1].rollNo}</p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex justify-between text-xs">
              <span className="text-slate-400">Dept: {filteredRankings[1].departmentCode}</span>
              <span className="font-extrabold text-brand-600">{filteredRankings[1].cgpa.toFixed(2)} CGPA</span>
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="glass-card p-6 flex flex-col items-center text-center order-1 md:order-2 border-t-4 border-t-amber-500 shadow-lg scale-105 bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-black text-2xl mb-3 shadow-md">
              👑
            </div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Rank #1 Valedictorian</span>
            <Link
              to={`/admin/students/${filteredRankings[0]._id}`}
              className="text-lg font-black text-slate-900 dark:text-white mt-1 hover:underline"
            >
              {filteredRankings[0].name}
            </Link>
            <p className="text-xs font-mono text-slate-400">{filteredRankings[0].rollNo}</p>
            <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-slate-800 w-full flex justify-between text-xs">
              <span className="text-slate-500">Dept: {filteredRankings[0].departmentCode}</span>
              <span className="font-black text-emerald-600 text-sm">{filteredRankings[0].cgpa.toFixed(2)} CGPA</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="glass-card p-6 flex flex-col items-center text-center order-3 border-t-4 border-t-amber-700">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 flex items-center justify-center font-black text-xl mb-3">
              🥉
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rank #3 Overall</span>
            <Link
              to={`/admin/students/${filteredRankings[2]._id}`}
              className="text-base font-bold text-slate-900 dark:text-white mt-1 hover:underline"
            >
              {filteredRankings[2].name}
            </Link>
            <p className="text-xs font-mono text-slate-400">{filteredRankings[2].rollNo}</p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex justify-between text-xs">
              <span className="text-slate-400">Dept: {filteredRankings[2].departmentCode}</span>
              <span className="font-extrabold text-brand-600">{filteredRankings[2].cgpa.toFixed(2)} CGPA</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or roll number..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

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
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Computing dense window rankings..." />
        ) : filteredRankings.length === 0 ? (
          <EmptyState title="No ranked students match query" description="Adjust your filters or reset search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Overall Rank</th>
                  <th className="py-3 px-4">Dept Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Semester</th>
                  <th className="py-3 px-4 text-center">Attendance %</th>
                  <th className="py-3 px-4 text-center">Backlogs</th>
                  <th className="py-3 px-4 text-right">CGPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRankings.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">{getRankBadge(r.overallRank)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                      #{r.departmentRank} in {r.departmentCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/admin/students/${r._id}`}
                        className="font-bold text-slate-900 dark:text-white hover:underline block"
                      >
                        {r.name}
                      </Link>
                      <span className="font-mono text-[10px] text-slate-400">{r.rollNo}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {r.departmentCode}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">Sem {r.semester}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {r.attendanceRate}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-bold text-[11px] ${
                          r.backlogs > 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {r.backlogs}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {r.cgpa.toFixed(2)}
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
