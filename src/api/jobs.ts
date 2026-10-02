import { apiClient } from './client';
import { store } from './store';
import { Job, FitLevel, EvidenceStatus, PipelineStage } from '../types';

export interface JobFilterParams {
  search?: string;
  role?: string;
  seniority?: string;
  location?: string;
  minSalary?: number;
  germanRequirement?: string;
  workModel?: string;
  relocationStatus?: EvidenceStatus | 'all';
  technicalFit?: FitLevel | 'all';
  status?: PipelineStage | 'all';
  limit?: number;
  offset?: number;
}

export const jobsApi = {
  async getJobs(params?: JobFilterParams): Promise<Job[]> {
    try {
      const queryParams: Record<string, any> = {};
      if (params) {
        if (params.search) queryParams.search = params.search;
        if (params.location && params.location !== 'all') queryParams.location = params.location;
        if (params.status && params.status !== 'all') queryParams.status = params.status;
        if (params.technicalFit && params.technicalFit !== 'all') queryParams.fit = params.technicalFit;
        if (params.role) queryParams.role = params.role;
        if (params.seniority && params.seniority !== 'all') queryParams.seniority = params.seniority;
        if (params.workModel && params.workModel !== 'all') queryParams.workModel = params.workModel;
        if (params.limit) queryParams.limit = params.limit;
        if (params.offset) queryParams.offset = params.offset;
      }
      return await apiClient.get<Job[]>('/jobs', { params: queryParams });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      console.warn('Jobs API call failed, falling back to mock store:', err);
      let jobs = store.getJobs();
      if (!params) return jobs;
      if (params.search) {
        const q = params.search.toLowerCase();
        jobs = jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.companyName.toLowerCase().includes(q) ||
            j.location.toLowerCase().includes(q)
        );
      }
      return jobs;
    }
  },

  async getJob(id: string): Promise<Job | null> {
    try {
      return await apiClient.get<Job>(`/jobs/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      if (import.meta.env.PROD) throw err;
      return store.getJobById(id) || null;
    }
  },

  async updateJob(id: string, update: Partial<Job>): Promise<Job> {
    try {
      return await apiClient.patch<Job>(`/jobs/${id}`, update);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.updateJob(id, update);
    }
  },
};
