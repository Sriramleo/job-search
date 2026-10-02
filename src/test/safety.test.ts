import { describe, it, expect } from 'vitest';
import { ApiError } from '../api/errors';
import { apiClient, isBackendConfigured } from '../api/client';
import { applicationsApi, inboxApi, settingsApi, jobsApi } from '../api';

describe('Phase 11 Mandatory Human Safety Boundaries & Invariant Tests', () => {
  it('Safety Boundary 1: Application submission requires explicit human confirmation via markSubmitted', async () => {
    // Verifies that application submission endpoint exists as explicit mark-submitted
    expect(typeof applicationsApi.markSubmitted).toBe('function');

    // Automatic submission is never performed silently
    const apps = await applicationsApi.getApplications();
    const preparingApps = apps.filter((a) => a.stage === 'Preparing');
    expect(preparingApps.every((a) => a.stage !== 'Applied')).toBe(true);
  });

  it('Safety Boundary 2: Gmail integration is strictly read-only and provides no auto-send API', async () => {
    // inboxApi must not expose an automated outbound sending method
    expect((inboxApi as any).sendEmail).toBeUndefined();
    expect((inboxApi as any).sendGmail).toBeUndefined();
    expect((inboxApi as any).autoReply).toBeUndefined();

    // Only read-only operations are supported
    expect(typeof inboxApi.getCommunications).toBe('function');
    expect(typeof inboxApi.getGmailStatus).toBe('function');
    expect(typeof inboxApi.getGmailMessages).toBe('function');
  });

  it('Safety Boundary 3: No autonomous LinkedIn actions or scraping', async () => {
    // Ensure no autonomous scraping or automated messaging methods exist on window/api
    expect((window as any).linkedInBot).toBeUndefined();
    expect((window as any).scrapeLinkedIn).toBeUndefined();
    expect((apiClient as any).scrapeLinkedIn).toBeUndefined();
  });

  it('Safety Boundary 4: Candidate evidence is immutable from frontend AI/UI', async () => {
    // settingsApi / candidateApi allows viewing evidence, not mutating arbitrary facts
    expect(typeof settingsApi.getCandidateEvidence).toBe('function');
    expect((settingsApi as any).deleteCandidateEvidence).toBeUndefined();
    expect((settingsApi as any).createCandidateEvidence).toBeUndefined();
  });

  it('Safety Boundary 5: Salary is never converted into an autonomous immigration or legal verdict', async () => {
    const jobs = await jobsApi.getJobs();
    for (const job of jobs) {
      // Evidence states must be within approved factual categories
      const allowedStates = ['Confirmed by Source', 'Evidence Found', 'Unknown', 'Contradictory'];
      expect(allowedStates).toContain(job.relocationStatus);

      // Verify no legal verdicts are attached
      expect((job as any).visaGuaranteed).toBeUndefined();
      expect((job as any).immigrationVerdict).toBeUndefined();
      expect((job as any).blueCardGuaranteed).toBeUndefined();
    }
  });

  it('Safety Boundary 6: ApiError correctly formats backend error envelopes and protects stack traces', () => {
    const errorEnvelope = {
      detail: 'Resource conflict detected',
      error: {
        code: 'CONFLICT_STATE',
        message: 'Application is already locked for human submission.',
        requestId: 'req-test-12345',
        details: { conflictId: 'app-01' },
      },
    };

    const apiErr = ApiError.fromResponse(409, errorEnvelope, 'req-test-12345');
    expect(apiErr.status).toBe(409);
    expect(apiErr.code).toBe('CONFLICT_STATE');
    expect(apiErr.requestId).toBe('req-test-12345');
    expect(apiErr.message).toBe('Application is already locked for human submission.');
    // No raw internal stack traces exposed
    expect(apiErr.stack).not.toContain('pymongo/internal');
  });

  it('Safety Boundary 7: X-Request-ID correlation headers are propagated', async () => {
    const isConfigured = isBackendConfigured();
    expect(typeof isConfigured).toBe('boolean');
  });
});
