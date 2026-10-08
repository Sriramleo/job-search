import { apiClient } from './client';
import { AIUsage } from '../types';

export interface TimeWindowParams {
  window?: 'today' | '7d' | '30d' | '90d' | 'custom' | string;
  from?: string;
  to?: string;
}

export const analyticsApi = {
  async getOverview() {
    try {
      return await apiClient.get('/analytics/overview');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getJobFunnel(params?: TimeWindowParams) {
    try {
      return await apiClient.get('/analytics/jobs/funnel', { params: params as any });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getApplicationFunnel() {
    try {
      return await apiClient.get('/analytics/applications/funnel');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getApplicationPerformance() {
    try {
      return await apiClient.get('/analytics/applications/performance');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getCommunicationAnalytics() {
    try {
      return await apiClient.get('/analytics/communications');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getGmailAnalytics() {
    try {
      return await apiClient.get('/analytics/gmail');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getAICost() {
    try {
      return await apiClient.get('/analytics/ai');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getAIAnomalies() {
    try {
      return await apiClient.get('/analytics/ai/anomalies');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getOrchestrationHealth() {
    try {
      return await apiClient.get('/analytics/orchestration');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getDataQuality() {
    try {
      return await apiClient.get('/analytics/data-quality');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getAlerts() {
    try {
      return await apiClient.get('/analytics/alerts');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getDailySummary() {
    try {
      return await apiClient.get('/analytics/daily-summary');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getActionQueue() {
    try {
      return await apiClient.get('/analytics/action-queue');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getCosts() {
    try {
      return await apiClient.get('/analytics/costs');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  // Backward compatible methods
  async getAIUsage(): Promise<AIUsage[]> {
    try {
      return await apiClient.get<AIUsage[]>('/analytics/ai-usage');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return [];
    }
  },

  async getAnalyticsData() {
    try {
      return await apiClient.get('/analytics/summary');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getSidebarCounts(): Promise<{
    jobs: number;
    companies: number;
    contacts: number;
    applications: number;
    interviews: number;
    tasks: number;
    inbox: number;
    documents: number;
    research: number;
  }> {
    try {
      return await apiClient.get('/analytics/sidebar-counts');
    } catch {
      return {
        jobs: 0,
        companies: 0,
        contacts: 0,
        applications: 0,
        interviews: 0,
        tasks: 0,
        inbox: 0,
        documents: 0,
        research: 0,
      };
    }
  },

  async getOutcomeAnalytics(): Promise<import('../types').OutcomeAnalyticsResponse | null> {
    try {
      return await apiClient.get<import('../types').OutcomeAnalyticsResponse>('/analytics/outcomes');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },
};
