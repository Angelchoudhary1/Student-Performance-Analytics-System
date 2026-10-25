import React from 'react';
import { Settings, Shield, Sliders, Database, Key, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System settings saved successfully');
  };

  const handleReseedPrompt = () => {
    toast('To re-seed the full dataset, run `npm run seed` in your terminal.', {
      icon: 'ℹ️',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          System Configurations & Grading Scale
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Academic year parameters, attendance risk threshold, and MongoDB connection options
        </p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-brand-600" />
              Academic Year & Evaluation Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Active Academic Year
                </label>
                <input
                  type="text"
                  defaultValue="2025-2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Attendance Cutoff (%)
                </label>
                <input
                  type="number"
                  defaultValue={75}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  At-Risk Warning Attendance Cutoff (%)
                </label>
                <input
                  type="number"
                  defaultValue={65}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Passing CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue={5.0}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Grading Scale Reference Table */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Standard 10-Point Academic Grading Scale Matrix
            </h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Percentage Range</th>
                    <th className="py-2.5 px-3 text-center">Letter Grade</th>
                    <th className="py-2.5 px-3 text-center">Grade Points</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2 px-3 font-semibold">90% - 100%</td>
                    <td className="py-2 px-3 text-center font-bold text-purple-600">O</td>
                    <td className="py-2 px-3 text-center font-bold">10.0</td>
                    <td className="py-2 px-3 text-slate-500">Outstanding</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">Pass</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">80% - 89.99%</td>
                    <td className="py-2 px-3 text-center font-bold text-indigo-600">A+</td>
                    <td className="py-2 px-3 text-center font-bold">9.0</td>
                    <td className="py-2 px-3 text-slate-500">Excellent</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">Pass</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">70% - 79.99%</td>
                    <td className="py-2 px-3 text-center font-bold text-blue-600">A</td>
                    <td className="py-2 px-3 text-center font-bold">8.0</td>
                    <td className="py-2 px-3 text-slate-500">Very Good</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">Pass</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">60% - 69.99%</td>
                    <td className="py-2 px-3 text-center font-bold text-teal-600">B+</td>
                    <td className="py-2 px-3 text-center font-bold">7.0</td>
                    <td className="py-2 px-3 text-slate-500">Good</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">Pass</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">50% - 59.99%</td>
                    <td className="py-2 px-3 text-center font-bold text-cyan-600">B</td>
                    <td className="py-2 px-3 text-center font-bold">6.0</td>
                    <td className="py-2 px-3 text-slate-500">Above Average</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">Pass</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">40% - 49.99%</td>
                    <td className="py-2 px-3 text-center font-bold text-yellow-600">C</td>
                    <td className="py-2 px-3 text-center font-bold">5.0</td>
                    <td className="py-2 px-3 text-slate-500">Pass Average</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">Pass</td>
                  </tr>
                  <tr className="bg-rose-50/50 dark:bg-rose-950/20">
                    <td className="py-2 px-3 font-semibold text-rose-700">&lt; 40%</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-600">F</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-600">0.0</td>
                    <td className="py-2 px-3 text-rose-700">Fail / Arrear</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-600">Fail</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReseedPrompt}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
            >
              Re-seed Database Info
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
