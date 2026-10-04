import { apiClient } from './client';
import { Interview } from '../types';

export interface InterviewFilterParams {
  applicationId?: string;
  jobId?: string;
  status?: string;
  limit?: number;
  skip?: number;
}

export const interviewsApi = {
  async getInterviews(params?: InterviewFilterParams): Promise<Interview[]> {
    return await apiClient.get<Interview[]>('/interviews', { params: params as any });
  },

  async getInterview(id: string): Promise<Interview | null> {
    try {
      return await apiClient.get<Interview>(`/interviews/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },
};

