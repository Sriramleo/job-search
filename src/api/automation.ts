import { apiClient } from './client';
import { store } from './store';
import { AutomationRun } from '../types';

export const automationApi = {
  async getAutomationRuns(): Promise<AutomationRun[]> {
    try {
      return await apiClient.get<AutomationRun[]>('/system/automation-runs');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      console.warn('Automation runs API call failed, falling back to mock store:', err);
      return store.getAutomationRuns();
    }
  },

  async toggleAutomation(id: string): Promise<AutomationRun> {
    try {
      return await apiClient.post<AutomationRun>(`/system/automation-runs/${id}/toggle`);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.toggleAutomationRun(id);
    }
  },

  async getOrchestrationStatus() {
    try {
      return await apiClient.get('/orchestration/status');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getOrchestrationRuns(params?: { workflow?: string; status?: string; limit?: number }) {
    try {
      return await apiClient.get('/orchestration/runs', { params });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return [];
    }
  },

  async triggerWorkflow(workflow: string, options?: { dryRun?: boolean; idempotencyKey?: string }) {
    return await apiClient.post(`/orchestration/run/${workflow}`, options || {});
  },
};
