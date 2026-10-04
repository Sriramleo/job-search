import { apiClient } from './client';
import { ResearchEvidence } from '../types';

export interface ResearchEvidenceFilterParams {
  category?: string;
  status?: string;
  entityId?: string;
  entityType?: string;
  researchRunId?: string;
  limit?: number;
  skip?: number;
}

export const researchApi = {
  async getResearchEvidence(
    filter?: string | ResearchEvidenceFilterParams
  ): Promise<ResearchEvidence[]> {
    const params: Record<string, any> = {};
    if (typeof filter === 'string') {
      if (filter && filter !== 'all') params.category = filter;
    } else if (filter) {
      if (filter.category && filter.category !== 'all') params.category = filter.category;
      if (filter.status && filter.status !== 'all') params.status = filter.status;
      if (filter.entityId) params.entityId = filter.entityId;
      if (filter.entityType) params.entityType = filter.entityType;
      if (filter.researchRunId) params.researchRunId = filter.researchRunId;
      if (filter.limit) params.limit = filter.limit;
      if (filter.skip) params.skip = filter.skip;
    }
    return await apiClient.get<ResearchEvidence[]>('/research/evidence', { params });
  },

  async getJobResearch(jobId: string) {
    try {
      return await apiClient.get(`/research/jobs/${jobId}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async getCandidateMatch(jobId: string) {
    try {
      return await apiClient.get(`/research/jobs/${jobId}/candidate-match`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async triggerResearchRun(jobId: string, options?: any) {
    return await apiClient.post('/research/runs', { jobId, ...(options || {}) });
  },
};

