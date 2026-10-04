import { apiClient } from './client';
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
      if (params.offset) queryParams.skip = params.offset;
    }
    let jobs = await apiClient.get<Job[]>('/jobs', { params: queryParams });
    if (params?.minSalary) {
      jobs = jobs.filter((j) => (j.salaryMax || j.salaryMin || 0) >= (params.minSalary || 0));
    }
    return jobs;
  },

  async getJob(id: string): Promise<Job | null> {
    try {
      return await apiClient.get<Job>(`/jobs/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async updateJob(id: string, update: Partial<Job>): Promise<Job> {
    return await apiClient.patch<Job>(`/jobs/${id}`, update);
  },
};

