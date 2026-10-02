import { apiClient } from './client';

export interface WorkflowRunOptions {
  dryRun?: boolean;
  idempotencyKey?: string;
  parameters?: Record<string, any>;
}

export const orchestrationApi = {
  async triggerWorkflow(workflow: string, options: WorkflowRunOptions = {}) {
    return await apiClient.post(`/orchestration/run/${workflow}`, options);
  },

  async getRuns(params?: { workflow?: string; status?: string; limit?: number; skip?: number }) {
    try {
      return await apiClient.get('/orchestration/runs', { params });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return [];
    }
  },

  async getRun(runId: string) {
    return await apiClient.get(`/orchestration/runs/${runId}`);
  },

  async getStatus() {
    try {
      return await apiClient.get('/orchestration/status');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },
};
