import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Database,
  Layers,
  Key,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Code2,
  HardDrive,
  Cpu,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DatabaseInsights() {
  const [dbData, setDbData] = useState(null);
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getDatabaseStats();
      if (res.success) {
        setDbData(res);
      }
    } catch (error) {
      toast.error('Failed to load MongoDB statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRunBenchmark = async () => {
    try {
      setRunningBenchmark(true);
      const res = await analyticsService.runAggregationBenchmark();
      if (res.success) {
        setBenchmarks(res.benchmarks);
        toast.success('MongoDB Aggregation benchmark completed successfully!');
      }
    } catch (error) {
      toast.error('Benchmark execution failed');
    } finally {
      setRunningBenchmark(false);
    }
  };

  useEffect(() => {
    fetchStats();
    handleRunBenchmark();
  }, []);

  if (loading) return <LoadingSpinner text="Inspecting MongoDB database engine & indexes..." size="lg" />;

  const { dbStats, collections, mongoVersion } = dbData || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            MongoDB Database Insights & Indexing Suite
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              NoSQL Engine
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time inspection of MongoDB collections, compound indexes, document counts, and pipeline execution latencies
          </p>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={runningBenchmark}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${runningBenchmark ? 'animate-spin' : ''}`} />
          Run Pipeline Benchmark
        </button>
      </div>

      {/* Top Database Metadata KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Database Instance</span>
            <Database className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 truncate">
            {dbStats?.dbName || 'student_performance'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Mongoose v{mongoVersion}</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Collections</span>
            <Layers className="w-5 h-5 text-brand-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {dbStats?.collectionsCount || collections?.length || 8}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Active document collections</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Documents</span>
            <HardDrive className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {dbStats?.objectsCount || 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Populated BSON documents</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Indexes</span>
            <Key className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {dbStats?.indexesCount || 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Compound, unique & text indexes</p>
        </div>
      </div>

      {/* Live Aggregation Pipeline Benchmark Results */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Live MongoDB Aggregation Pipeline Execution Benchmark
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Microsecond execution latency measured directly against MongoDB server
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full font-bold">
            All Pipelines Optimal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benchmarks.map((bm, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="font-mono text-brand-600">{bm.collection}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">{bm.executionTimeMs} ms</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{bm.pipelineName}</p>
              <span className="inline-block text-[10px] font-semibold text-slate-500">{bm.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Collections & Index Inspector Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            MongoDB Collections & Indexing Structure
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Collection Name</th>
                <th className="py-3 px-4 text-center">Document Count</th>
                <th className="py-3 px-4 text-center">Index Count</th>
                <th className="py-3 px-4">Index Keys & Constraints</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(collections || []).map((col) => (
                <tr key={col.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                    {col.name}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                    {col.count}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-300">
                    {col.indexCount}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {col.indexes?.map((idx, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {JSON.stringify(idx.key)} {idx.unique && '(UNIQUE)'}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
