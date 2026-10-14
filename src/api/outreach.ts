import { apiClient } from './client';
import {
  OutreachQueueItem,
  OutreachConfig,
  SuppressionRecord,
} from '../types';

export interface OutreachQueueFilterParams {
  status?: string;
  companyId?: string;
  limit?: number;
  skip?: number;
}

export const outreachApi = {
  async getQueue(params?: OutreachQueueFilterParams): Promise<OutreachQueueItem[]> {
    const queryParams: Record<string, any> = {};
    if (params) {
      if (params.status && params.status !== 'all') queryParams.status = params.status;
      if (params.companyId) queryParams.companyId = params.companyId;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.skip !== undefined) queryParams.skip = params.skip;
    }
    return await apiClient.get<OutreachQueueItem[]>('/outreach/queue', { params: queryParams });
  },

  async getQueueItem(id: string): Promise<OutreachQueueItem> {
    return await apiClient.get<OutreachQueueItem>(`/outreach/queue/${id}`);
  },

  async approveDraft(id: string): Promise<OutreachQueueItem> {
    return await apiClient.post<OutreachQueueItem>(`/outreach/queue/${id}/approve`);
  },

  async rejectDraft(id: string, reason: string = 'User discarded draft'): Promise<OutreachQueueItem> {
    return await apiClient.post<OutreachQueueItem>(`/outreach/queue/${id}/reject`, undefined, {
      params: { reason },
    });
  },

  async getConfig(): Promise<OutreachConfig> {
    return await apiClient.get<OutreachConfig>('/outreach/config');
  },

  async getSuppressions(limit: number = 100, skip: number = 0): Promise<SuppressionRecord[]> {
    return await apiClient.get<SuppressionRecord[]>('/outreach/suppressions', {
      params: { limit, skip },
    });
  },

  async addSuppression(targetType: 'email' | 'domain' | 'contact_id', targetValue: string, reason: string = 'User opt-out'): Promise<SuppressionRecord> {
    return await apiClient.post<SuppressionRecord>('/outreach/suppressions', {
      targetType,
      targetValue,
      reason,
    });
  },

  async deleteSuppression(id: string): Promise<void> {
    await apiClient.delete(`/outreach/suppressions/${id}`);
  },
};
