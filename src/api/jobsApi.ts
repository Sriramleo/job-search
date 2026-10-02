import { store } from './store';
import { Job, FitLevel, EvidenceStatus, PipelineStage } from '../types';
import { backendJobsApi, isBackendConnected } from './backendClient';

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
}

export const jobsApi = {
  async getJobs(params?: JobFilterParams): Promise<Job[]> {
    if (isBackendConnected()) {
      try {
        return await backendJobsApi.getJobs(params);
      } catch (err) {
        console.warn('Backend getJobs failed, falling back to mock store:', err);
      }
    }

    let jobs = store.getJobs();
    if (!params) return jobs;

    if (params.search) {
      const q = params.search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.keySkills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (params.location && params.location !== 'all') {
      const loc = params.location.toLowerCase();
      jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc));
    }
    if (params.minSalary) {
      jobs = jobs.filter((j) => j.salaryMax >= (params.minSalary || 0));
    }
    if (params.seniority && params.seniority !== 'all') {
      jobs = jobs.filter((j) => j.seniority === params.seniority);
    }
    if (params.workModel && params.workModel !== 'all') {
      jobs = jobs.filter((j) => j.workModel === params.workModel);
    }
    if (params.germanRequirement && params.germanRequirement !== 'all') {
      jobs = jobs.filter((j) => j.germanRequirement === params.germanRequirement);
    }
    if (params.relocationStatus && params.relocationStatus !== 'all') {
      jobs = jobs.filter((j) => j.relocationStatus === params.relocationStatus);
    }
    if (params.technicalFit && params.technicalFit !== 'all') {
      jobs = jobs.filter((j) => j.technicalFit === params.technicalFit);
    }
    if (params.status && params.status !== 'all') {
      jobs = jobs.filter((j) => j.status === params.status);
    }

    return jobs;
  },

  async getJob(id: string): Promise<Job | null> {
    if (isBackendConnected()) {
      try {
        const job = await backendJobsApi.getJob(id);
        if (job) return job;
      } catch (err) {
        console.warn(`Backend getJob(${id}) failed, falling back to mock store:`, err);
      }
    }
    const job = store.getJobById(id);
    return job || null;
  },

  async updateJob(id: string, update: Partial<Job>): Promise<Job> {
    if (isBackendConnected()) {
      try {
        return await backendJobsApi.updateJob(id, update);
      } catch (err) {
        console.warn(`Backend updateJob(${id}) failed, falling back to mock store:`, err);
      }
    }
    return store.updateJob(id, update);
  },
};

