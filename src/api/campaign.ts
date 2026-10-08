import { apiClient } from './client';
import {
  CampaignConfig,
  CampaignCycleExecutionResult,
  CampaignDailyQuota,
  CampaignDailyStatus,
  CampaignQueueEvaluationResult,
  CampaignRun,
  DailyCampaignReport,
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

  async getQuota(date?: string): Promise<CampaignDailyQuota> {
    return await apiClient.get<CampaignDailyQuota>('/campaign/quota', {
      params: date ? { date } : undefined,
    });
  },

  async armStage1(): Promise<CampaignConfig> {
    return await apiClient.post<CampaignConfig>('/campaign/arm-stage-1', {});
  },

  async setStage0DryRun(): Promise<CampaignConfig> {
    return await apiClient.post<CampaignConfig>('/campaign/stage-0-dry-run', {});
  },

  async runCycle(dryRun = true): Promise<CampaignCycleExecutionResult> {
    return await apiClient.post<CampaignCycleExecutionResult>('/campaign/run-cycle', {}, {
      params: { dry_run: dryRun },
    });
  },

  async getDailyReport(date?: string): Promise<DailyCampaignReport> {
    return await apiClient.get<DailyCampaignReport>('/campaign/daily-report', {
      params: date ? { date } : undefined,
    });
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

