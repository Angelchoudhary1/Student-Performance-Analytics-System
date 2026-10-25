import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { analyticsService } from '../../services/analyticsService';
import RiskBadge from '../../components/common/RiskBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  Lightbulb,
  Award,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Target,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentAIReport() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      let studentId = user?.studentProfile?._id;
      if (!studentId) {
        const list = await studentService.getStudents({ limit: 1 });
        if (list.success && list.data.length > 0) studentId = list.data[0]._id;
      }

      if (studentId) {
        const res = await studentService.getStudentById(studentId);
        if (res.success) setProfileData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const handleRecompute = async () => {
    try {
      setRefreshing(true);
      if (profileData?.student?._id) {
        const res = await analyticsService.predictStudent(profileData.student._id);
        if (res.success) {
          toast.success('AI Prediction recomputed using Scikit-Learn Model!');
          fetchStudentData();
        }
      }
    } catch (err) {
      toast.error('Failed to update prediction');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <LoadingSpinner text="Generating personalized AI predictive advisory..." />;

  const { student, prediction } = profileData || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            AI Predictive Academic Advisory Report
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
              Scikit-Learn AI
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Machine Learning forecasted performance, graduation trajectory, and prescriptive advice
          </p>
        </div>

        <button
          onClick={handleRecompute}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh AI Analysis
        </button>
      </div>

      {/* Main Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 bg-gradient-to-br from-brand-600 to-indigo-800 text-white rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
              Predicted Final CGPA
            </span>
          </div>
          <h2 className="text-5xl font-black">{prediction?.predictedCGPA?.toFixed(2) || '8.50'}</h2>
          <p className="text-xs text-brand-100 mt-2">
            Expected Grade Award: <strong className="text-white">Grade {prediction?.predictedGrade || 'A'}</strong>
          </p>
          <div className="mt-6 pt-4 border-t border-brand-400/30 text-[11px] text-brand-200">
            Model: {prediction?.modelType}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pass Probability</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {prediction?.passProbability || 90}%
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Likelihood of completing current semester successfully without backlogs.
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${prediction?.passProbability || 90}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">On-Time Degree Completion</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {prediction?.onTimeGraduationProbability || 95}%
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Zero backlog graduation completion probability index.
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-brand-600 h-full rounded-full"
              style={{ width: `${prediction?.onTimeGraduationProbability || 95}%` }}
            />
          </div>
        </div>
      </div>

      {/* Risk Factors Diagnostic */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Identified Risk Factors & Continuous Assessment Diagnostics
        </h3>
        {prediction?.riskFactors?.length === 0 ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            No academic risk factors detected. Keep up the high consistency!
          </div>
        ) : (
          <div className="space-y-3">
            {prediction?.riskFactors?.map((rf, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                  <span>{rf.factor}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px]">
                    {rf.severity} Severity
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{rf.impact}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescriptive Recommendations */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-brand-500" />
          Personalized AI Action Plan & Recommended Next Steps
        </h3>
        <div className="space-y-3">
          {prediction?.recommendations?.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start justify-between gap-4"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{rec.action}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  rec.priority === 'Urgent'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950'
                    : 'bg-brand-100 text-brand-700 dark:bg-brand-950'
                }`}
              >
                {rec.priority} Priority
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
