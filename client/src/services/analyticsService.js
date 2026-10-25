import api from './api';

export const analyticsService = {
  // Real MongoDB Aggregation Dashboard
  getDashboardAnalytics: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },

  // Smart Rankings
  getRankings: async (params) => {
    const res = await api.get('/analytics/rankings', { params });
    return res.data;
  },

  // At-Risk Students Pipeline
  getAtRiskStudents: async (params) => {
    const res = await api.get('/analytics/at-risk', { params });
    return res.data;
  },

  // AI Predictions
  getAllPredictions: async (params) => {
    const res = await api.get('/predictions', { params });
    return res.data;
  },
  predictStudent: async (studentId) => {
    const res = await api.post(`/predictions/student/${studentId}`);
    return res.data;
  },
  simulatePrediction: async (features) => {
    const res = await api.post('/predictions/simulate', features);
    return res.data;
  },
  batchPredict: async () => {
    const res = await api.post('/predictions/batch');
    return res.data;
  },

  // Database Insights (MongoDB Metrics & Benchmark)
  getDatabaseStats: async () => {
    const res = await api.get('/db-insights/stats');
    return res.data;
  },
  runAggregationBenchmark: async () => {
    const res = await api.post('/db-insights/benchmark');
    return res.data;
  },
};
