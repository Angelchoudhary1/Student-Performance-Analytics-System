import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import RiskBadge from '../../components/common/RiskBadge';
import GradeBadge from '../../components/common/GradeBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Sparkles,
  Sliders,
  BrainCircuit,
  Lightbulb,
  ShieldAlert,
  GraduationCap,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PredictionsStudio() {
  const [features, setFeatures] = useState({
    attendanceRate: 85.0,
    internalAvg: 16.5,
    assignmentAvg: 8.5,
    midtermAvg: 24.0,
    previousCgpa: 8.2,
    backlogs: 0,
    studyHoursPerWeek: 15.0,
  });

  const [prediction, setPrediction] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);

  const runSimulation = async (inputFeatures = features) => {
    try {
      setSimulating(true);
      const res = await analyticsService.simulatePrediction(inputFeatures);
      if (res.success) {
        setPrediction(res.data);
      }
    } catch (error) {
      toast.error('Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const handleSliderChange = (field, value) => {
    const updated = { ...features, [field]: Number(value) };
    setFeatures(updated);
    runSimulation(updated);
  };

  const handleReset = () => {
    const defaultFeatures = {
      attendanceRate: 85.0,
      internalAvg: 16.5,
      assignmentAvg: 8.5,
      midtermAvg: 24.0,
      previousCgpa: 8.2,
      backlogs: 0,
      studyHoursPerWeek: 15.0,
    };
    setFeatures(defaultFeatures);
    runSimulation(defaultFeatures);
    toast.success('Simulation parameters reset to baseline');
  };

  const handleBatchPredict = async () => {
    try {
      setBatchRunning(true);
      const res = await analyticsService.batchPredict();
      if (res.success) {
        toast.success(res.message || 'Batch AI inference completed for all MongoDB student records!');
      }
    } catch (err) {
      toast.error('Batch inference failed');
    } finally {
      setBatchRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            AI Predictive Intelligence Studio
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
              Scikit-Learn ML
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive What-If Simulation & Machine Learning Risk Modeling (Random Forest & Gradient Boosting)
          </p>
        </div>

        <button
          onClick={handleBatchPredict}
          disabled={batchRunning}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          <Cpu className={`w-4 h-4 ${batchRunning ? 'animate-spin' : ''}`} />
          Run Batch Inference on All Students
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 columns: Interactive Simulation Sliders */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Parameter Sliders</h3>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Baseline
              </button>
            </div>

            <div className="space-y-5">
              {/* Slider 1: Attendance */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">Attendance Rate</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">{features.attendanceRate}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="1"
                  value={features.attendanceRate}
                  onChange={(e) => handleSliderChange('attendanceRate', e.target.value)}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Internal Marks */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">Internal Continuous Assessment (/20)</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">{features.internalAvg}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={features.internalAvg}
                  onChange={(e) => handleSliderChange('internalAvg', e.target.value)}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Assignment Marks */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">Assignment Score (/10)</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">{features.assignmentAvg}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={features.assignmentAvg}
                  onChange={(e) => handleSliderChange('assignmentAvg', e.target.value)}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Slider 4: Midterm Evaluation */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">Midterm Examination (/30)</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">{features.midtermAvg}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={features.midtermAvg}
                  onChange={(e) => handleSliderChange('midtermAvg', e.target.value)}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Slider 5: Previous CGPA */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">Previous Cumulative CGPA (/10)</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">{features.previousCgpa}</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.1"
                  value={features.previousCgpa}
                  onChange={(e) => handleSliderChange('previousCgpa', e.target.value)}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Slider 6: Active Backlogs */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">Active Arrears / Backlogs</span>
                  <span className="font-mono text-rose-600 font-bold">{features.backlogs}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={features.backlogs}
                  onChange={(e) => handleSliderChange('backlogs', e.target.value)}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              {/* Slider 7: Study Hours per Week */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">Weekly Self-Study Time</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">{features.studyHoursPerWeek} hrs/week</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="35"
                  step="1"
                  value={features.studyHoursPerWeek}
                  onChange={(e) => handleSliderChange('studyHoursPerWeek', e.target.value)}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 columns: Instant ML Prediction Output */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main ML Forecast Score Card */}
          <div className="glass-card p-6 bg-gradient-to-br from-brand-600 to-indigo-800 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
                  Live ML Inference Output
                </span>
              </div>
              <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">
                Model: Random Forest
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <h2 className="text-5xl font-black">{prediction?.predictedCGPA?.toFixed(2) || '0.00'}</h2>
              <span className="text-xl font-bold text-brand-200">/ 10.0 CGPA</span>
              <div className="ml-auto">
                <span className="text-sm font-black px-3 py-1 rounded-xl bg-white text-brand-900 shadow">
                  Grade {prediction?.predictedGrade || 'A'}
                </span>
              </div>
            </div>

            <p className="text-xs text-brand-100 mt-2">
              Predicted Final Graduation CGPA calculated from continuous assessment vectors
            </p>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-brand-400/40 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-brand-200">Assigned Risk</p>
                <p className="text-sm font-black mt-0.5">{prediction?.riskLevel} Risk</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-brand-200">Pass Probability</p>
                <p className="text-sm font-black mt-0.5">{prediction?.passProbability}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-brand-200">On-Time Grad</p>
                <p className="text-sm font-black mt-0.5">{prediction?.onTimeGraduationProbability}%</p>
              </div>
            </div>
          </div>

          {/* Identified Risk Factors */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Model Feature Importance & Risk Factors
            </h3>
            {prediction?.riskFactors?.length === 0 ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                All simulation parameters exceed benchmark thresholds!
              </div>
            ) : (
              <div className="space-y-2">
                {prediction?.riskFactors?.map((rf, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-xs"
                  >
                    <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200 mb-0.5">
                      <span>{rf.factor}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900">
                        {rf.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">{rf.impact}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommended Actions */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-brand-500" />
              Prescriptive Academic Interventions
            </h3>
            <div className="space-y-2.5">
              {prediction?.recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">{rec.action}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-950 flex-shrink-0">
                    {rec.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
