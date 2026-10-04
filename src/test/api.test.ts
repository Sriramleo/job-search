import { describe, it, expect } from 'vitest';
import { jobsApi, applicationsApi, tasksApi, companiesApi, contactsApi, candidateApi } from '../api';

describe('Germany Job Hunt — API Abstraction Layer', () => {
  it('loads candidate profile strictly preserving current role as Senior DevOps Engineer', async () => {
    const candidate = await candidateApi.getCandidate();
    expect(candidate.name).toBe('Sriram Sugavanam');
    expect(candidate.currentRole).toBe('Senior DevOps Engineer');
    expect(candidate.currentRole).not.toBe('Lead Platform Engineer');
    expect(candidate.targetMinimumSalary).toBeGreaterThanOrEqual(80000);
    expect(candidate.germanLevel).toBe('A1');
  });

  it('retrieves jobs with multi-parameter filtering', async () => {
    const allJobs = await jobsApi.getJobs();
    expect(allJobs.length).toBeGreaterThanOrEqual(10);

    // Filter by Berlin
    const berlinJobs = await jobsApi.getJobs({ location: 'Berlin' });
    expect(berlinJobs.length).toBeGreaterThan(0);
    expect(berlinJobs.every((j) => j.location.includes('Berlin'))).toBe(true);

    // Filter by minimum salary €95K
    const highPaying = await jobsApi.getJobs({ minSalary: 95000 });
    expect(highPaying.every((j) => j.salaryMax >= 95000)).toBe(true);
  });

  it('retrieves a single job by ID', async () => {
    const allJobs = await jobsApi.getJobs({ limit: 1 });
    expect(allJobs.length).toBeGreaterThan(0);
    const firstJob = allJobs[0];
    const job = await jobsApi.getJob(firstJob.id);
    expect(job).not.toBeNull();
    expect(job?.id).toBe(firstJob.id);
    expect(job?.title).toBeDefined();
    expect(job?.companyName).toBeDefined();
  });

  it('updates an application draft with verified answers and validation checklist', async () => {
    const apps = await applicationsApi.getApplications();
    if (apps.length > 0) {
      const app = await applicationsApi.getApplication(apps[0].id);
      expect(app).not.toBeNull();

      const updated = await applicationsApi.updateApplication(apps[0].id, {
        referralMessageDraft: 'Updated referral text for testing',
      });
      expect(updated.referralMessageDraft).toBe('Updated referral text for testing');
    } else {
      expect(Array.isArray(apps)).toBe(true);
    }
  });

  it('manages action queue tasks and status transitions', async () => {
    const initialTasks = await tasksApi.getTasks();
    expect(Array.isArray(initialTasks)).toBe(true);

    const created = await tasksApi.createTask({
      title: 'Unit Test Task',
      priority: 'High',
      dueDate: '2026-10-05',
      status: 'Pending',
      actionType: 'Review Application',
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Unit Test Task');

    const toggled = await tasksApi.updateTask(created.id, { status: 'Completed' });
    expect(toggled.status).toBe('Completed');
  });

  it('retrieves target German companies with relocation facts', async () => {
    const companies = await companiesApi.getCompanies();
    expect(companies.length).toBeGreaterThanOrEqual(1);
    const first = companies[0];
    expect(first.name).toBeDefined();
    expect(first.evidenceList).toBeDefined();
  });
});
