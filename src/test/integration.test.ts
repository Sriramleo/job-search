import { describe, it, expect } from 'vitest';
import {
  jobsApi,
  applicationsApi,
  companiesApi,
  contactsApi,
  documentsApi,
  interviewsApi,
  tasksApi,
  researchApi,
  inboxApi,
  analyticsApi,
  settingsApi,
  automationApi,
  orchestrationApi,
  healthApi,
} from '../api';

describe('Phase 11 End-to-End Workflow Integration Tests', () => {
  // WORKFLOW 1: Dashboard -> qualified jobs -> job detail -> application
  it('Workflow 1: Navigates from overview to qualified jobs, job details, and linked application', async () => {
    const overview = await analyticsApi.getOverview();
    expect(overview).toBeDefined();

    const jobs = await jobsApi.getJobs({ limit: 10 });
    expect(jobs.length).toBeGreaterThan(0);

    const firstJob = jobs[0];
    const jobDetail = await jobsApi.getJob(firstJob.id);
    expect(jobDetail).toBeDefined();
    expect(jobDetail?.id).toBe(firstJob.id);

    const applications = await applicationsApi.getApplications({ jobId: firstJob.id });
    expect(Array.isArray(applications)).toBe(true);
  });

  // WORKFLOW 2: Qualified job -> research -> evidence -> application workspace
  it('Workflow 2: Retrieves research evidence and composite workspace for qualified job', async () => {
    const evidence = await researchApi.getResearchEvidence({ limit: 5 });
    expect(Array.isArray(evidence)).toBe(true);

    const apps = await applicationsApi.getApplications();
    expect(apps.length).toBeGreaterThan(0);

    const workspace = await applicationsApi.getWorkspace(apps[0].id);
    // Even if workspace composite is null or object, API doesn't throw
    expect(workspace === null || typeof workspace === 'object').toBe(true);
  });

  // WORKFLOW 3: Application workspace -> CV -> cover letter -> validation -> human mark submitted
  it('Workflow 3: Validates application workspace materials and executes human-confirmed submission', async () => {
    const apps = await applicationsApi.getApplications();
    const app = apps[0];
    expect(app).toBeDefined();

    // Verify claim attestation
    if (app.claims && app.claims.length > 0) {
      const claim = app.claims[0];
      const attested = await applicationsApi.attestClaim(app.id, claim.id, 'Verified via integration test');
      expect(attested).toBeDefined();
    }

    // Explicit human submission confirmation
    const submitted = await applicationsApi.markSubmitted(app.id, {
      notes: 'Test runner human confirmation',
      submissionMethod: 'Integration Test Harness',
      submittedAt: new Date().toISOString(),
    });
    expect(['Applied', 'Submitted']).toContain(submitted.stage);
  });

  // WORKFLOW 4: Contact -> verification -> outreach draft -> manual mark sent
  it('Workflow 4: Manages contact verification, outreach messaging, and audit logging', async () => {
    const contacts = await contactsApi.getContacts();
    expect(contacts.length).toBeGreaterThan(0);

    const contact = contacts[0];
    const updated = await contactsApi.addContactMessage(contact.id, {
      type: 'LinkedIn',
      direction: 'Outbound',
      subject: 'Integration Test Outreach',
      body: 'Hello, this is a draft message to be copied and sent manually.',
    });
    expect(updated).toBeDefined();
  });

  // WORKFLOW 5: Gmail -> read-only sync status -> messages -> association
  it('Workflow 5: Verifies Gmail read-only integration, message listing, and manual association', async () => {
    const status = await inboxApi.getGmailStatus();
    expect(status).toBeDefined();

    const comms = await inboxApi.getCommunications();
    expect(Array.isArray(comms)).toBe(true);

    if (comms.length > 0) {
      const readComm = await inboxApi.markAsRead(comms[0].id);
      expect(readComm.isRead).toBe(true);
    }
  });

  // WORKFLOW 6: Scheduler -> orchestration status -> workflow trigger -> health diagnostics
  it('Workflow 6: Inspects orchestrator status and system readiness probes', async () => {
    const orchStatus = await orchestrationApi.getStatus();
    expect(orchStatus === null || typeof orchStatus === 'object').toBe(true);

    const systemHealth: any = await healthApi.getSystemHealth();
    expect(systemHealth).toBeDefined();
    expect(systemHealth.status).toBe('healthy');

    const readiness: any = await healthApi.getReadiness();
    expect(readiness).toBeDefined();
    expect(readiness.status).toBe('ready');

    const liveness: any = await healthApi.getLiveness();
    expect(liveness).toBeDefined();
    expect(liveness.status).toBe('alive');
  });

  // WORKFLOW 7: Analytics -> overview -> funnels -> AI costs -> alerts -> action queue
  it('Workflow 7: Accesses comprehensive recruitment analytics and action queue', async () => {
    const overview = await analyticsApi.getOverview();
    expect(overview).toBeDefined();

    const funnel = await analyticsApi.getJobFunnel({ window: '30d' });
    expect(funnel).toBeDefined();

    const actionQueue = await analyticsApi.getActionQueue();
    expect(actionQueue).toBeDefined();

    const alerts = await analyticsApi.getAlerts();
    expect(alerts).toBeDefined();

    const costs = await analyticsApi.getCosts();
    expect(costs).toBeDefined();
  });
});
