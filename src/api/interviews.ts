import { apiClient } from './client';
import { store } from './store';
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
    try {
      return await apiClient.get<Interview[]>('/interviews', { params: params as any });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      console.warn('Interviews API call failed, falling back to mock store:', err);
      let interviews = store.getInterviews();
      if (params?.status && params.status !== 'all') {
        interviews = interviews.filter((i) => i.status === params.status);
      }
      return interviews;
    }
  },

  async getInterview(id: string): Promise<Interview | null> {
    try {
      return await apiClient.get<Interview>(`/interviews/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      if (import.meta.env.PROD) throw err;
      const all = store.getInterviews();
      return all.find((i) => i.id === id) || null;
    }
  },
};
