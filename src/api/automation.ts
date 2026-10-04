import { apiClient } from './client';
import { AutomationRun } from '../types';

export const automationApi = {
  async getAutomationRuns(): Promise<AutomationRun[]> {
    try {
      return await apiClient.get<AutomationRun[]>('/system/automation-runs');
    } catch {
      return [];
    }
  },

  async toggleAutomation(id: string): Promise<AutomationRun> {
    return await apiClient.post<AutomationRun>(`/system/automation-runs/${id}/toggle`);
  },

  async getOrchestrationStatus() {
    try {
      return await apiClient.get('/orchestration/status');
    } catch {
      return null;
    }
  },

  async getOrchestrationRuns(params?: { workflow?: string; status?: string; limit?: number }) {
    try {
      return await apiClient.get('/orchestration/runs', { params });
    } catch {
      return [];
    }
  },

  async triggerWorkflow(workflow: string, options?: { dryRun?: boolean; idempotencyKey?: string }) {
    return await apiClient.post(`/orchestration/run/${workflow}`, options || {});
  },
};

