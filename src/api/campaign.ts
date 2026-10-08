import { apiClient } from './client';
import {
  CampaignConfig,
  CampaignDailyStatus,
  CampaignQueueEvaluationResult,
  CampaignRun,
} from '../types';

export const campaignApi = {
  async getConfig(): Promise<CampaignConfig> {
    return await apiClient.get<CampaignConfig>('/campaign/config');
  },

  async updateConfig(update: Partial<CampaignConfig>): Promise<CampaignConfig> {
    return await apiClient.post<CampaignConfig>('/campaign/config', update);
  },

  async getStatus(): Promise<CampaignDailyStatus> {
    return await apiClient.get<CampaignDailyStatus>('/campaign/status');
  },

  async emergencyStop(): Promise<CampaignConfig> {
    return await apiClient.post<CampaignConfig>('/campaign/emergency-stop', {});
  },

  async evaluateQueue(): Promise<CampaignQueueEvaluationResult> {
    return await apiClient.post<CampaignQueueEvaluationResult>('/campaign/evaluate-queue', {});
  },

  async getRuns(limit = 50, skip = 0): Promise<CampaignRun[]> {
    return await apiClient.get<CampaignRun[]>('/campaign/runs', {
      params: { limit, skip },
    });
  },
};
