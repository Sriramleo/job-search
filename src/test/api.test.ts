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
    expect(allJobs.length).toBeGreaterThanOrEqual(15);

    // Filter by Berlin
    const berlinJobs = await jobsApi.getJobs({ location: 'Berlin' });
    expect(berlinJobs.length).toBeGreaterThan(0);
    expect(berlinJobs.every((j) => j.location.includes('Berlin'))).toBe(true);

    // Filter by minimum salary €95K
    const highPaying = await jobsApi.getJobs({ minSalary: 95000 });
    expect(highPaying.every((j) => j.salaryMax >= 95000)).toBe(true);
  });

  it('retrieves a single job by ID', async () => {
    const job = await jobsApi.getJob('job-zalando-01');
    expect(job).not.toBeNull();
    expect(job?.title).toBe('Lead Platform Engineer');
    expect(job?.companyName).toBe('Zalando SE');
    expect(job?.technicalFit).toBe('Strong');
    expect(job?.relocationStatus).toBe('Confirmed by Source');
  });

  it('updates an application draft with verified answers and validation checklist', async () => {
    const app = await applicationsApi.getApplication('app-zalando-01');
    expect(app).not.toBeNull();

    const updated = await applicationsApi.updateApplication('app-zalando-01', {
      referralMessageDraft: 'Updated referral text for testing',
    });
    expect(updated.referralMessageDraft).toBe('Updated referral text for testing');
  });

  it('manages action queue tasks and status transitions', async () => {
    const initialTasks = await tasksApi.getTasks();
    expect(initialTasks.length).toBeGreaterThanOrEqual(10);

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
    expect(companies.length).toBeGreaterThanOrEqual(8);
    const zalando = companies.find((c) => c.name === 'Zalando SE');
    expect(zalando?.internationalHiringEvidence).toBe('Confirmed by Source');
    expect(zalando?.evidenceList.length).toBeGreaterThan(0);
  });
});
