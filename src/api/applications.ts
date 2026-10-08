import { apiClient } from './client';
import { Application } from '../types';

export interface ApplicationFilterParams {
  stage?: string;
  route?: string;
  automationState?: string;
  outcomeState?: string;
  companyId?: string;
  jobId?: string;
  limit?: number;
  skip?: number;
}

export interface MarkSubmittedParams {
  notes?: string;
  submissionMethod?: string;
  externalReference?: string;
  submittedAt?: string;
}

export const applicationsApi = {
  async getApplications(params?: ApplicationFilterParams): Promise<Application[]> {
    return await apiClient.get<Application[]>('/applications', { params: params as any });
  },

  async createApplication(jobId: string, stage = 'Drafting'): Promise<Application> {
    return await apiClient.post<Application>('/applications', { jobId, stage });
  },

  async getApplication(id: string): Promise<Application | null> {
    try {
      return await apiClient.get<Application>(`/applications/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async updateApplication(id: string, update: Partial<Application>): Promise<Application> {
    return await apiClient.patch<Application>(`/applications/${id}`, update);
  },

  async attestClaim(applicationId: string, claimId: string, notes?: string): Promise<Application> {
    return await apiClient.post<Application>(`/applications/${applicationId}/claims/${claimId}/attest`, {
      candidateId: 'cand-sriram',
      attestationNotes: notes || 'Attested by candidate',
    });
  },

  async getWorkspace(applicationId: string, jobId?: string): Promise<any> {
    try {
      const params = jobId ? { jobId } : undefined;
      return await apiClient.get(`/applications/${applicationId}/workspace`, { params });
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async prepareApplication(applicationId: string, forceRefresh = false) {
    return await apiClient.post(`/applications/${applicationId}/prepare`, null, {
      params: { forceRefresh },
    });
  },

  async getPreparation(applicationId: string) {
    try {
      return await apiClient.get(`/applications/${applicationId}/preparation`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  /**
   * CRITICAL HUMAN SAFETY BOUNDARY:
   * Explicit confirmation that candidate has manually submitted the application in external ATS.
   */
  async markSubmitted(applicationId: string, request?: MarkSubmittedParams): Promise<Application> {
    return await apiClient.post<Application>(`/applications/${applicationId}/mark-submitted`, request || {});
  },

  async startAutomation(applicationId: string, options?: any) {
    return await apiClient.post(`/applications/${applicationId}/automation/start`, options || {});
  },

  async getAutomationSession(applicationId: string) {
    try {
      return await apiClient.get(`/applications/${applicationId}/automation`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async approveFill(applicationId: string, sessionId: string, approvedBy = 'human') {
    return await apiClient.post(
      `/applications/${applicationId}/automation/${sessionId}/approve-fill`,
      { approved_by: approvedBy }
    );
  },

  async pauseAutomation(applicationId: string, sessionId: string, reason?: string) {
    return await apiClient.post(
      `/applications/${applicationId}/automation/${sessionId}/pause`,
      { reason }
    );
  },

  async resumeAutomation(applicationId: string, sessionId: string, notes?: string) {
    return await apiClient.post(
      `/applications/${applicationId}/automation/${sessionId}/resume`,
      { notes }
    );
  },

  async cancelAutomation(applicationId: string, sessionId: string, reason?: string) {
    return await apiClient.post(
      `/applications/${applicationId}/automation/${sessionId}/cancel`,
      { reason }
    );
  },

  /**
   * PHASE 18 EXPLICIT HUMAN APPROVAL & ATS SUBMISSION:
   * Triggers verified Playwright submission on external ATS after human approval.
   */
  async approveAndSubmit(
    applicationId: string,
    request: import('../types').ApproveAndSubmitRequest
  ): Promise<import('../types').SubmissionResult> {
    return await apiClient.post<import('../types').SubmissionResult>(
      `/applications/${applicationId}/approve-and-submit`,
      request
    );
  },

  async markReviewed(
    applicationId: string,
    reviewer = 'human',
    notes?: string
  ): Promise<Application> {
    return await apiClient.post<Application>(
      `/applications/${applicationId}/mark-reviewed`,
      null,
      { params: { reviewer, notes } }
    );
  },

  async getApplicationOutcome(id: string): Promise<import('../types').ApplicationOutcomeDetail | null> {
    try {
      return await apiClient.get<import('../types').ApplicationOutcomeDetail>(`/applications/${id}/outcome`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async getApplicationTimeline(id: string): Promise<import('../types').ApplicationTimelineEvent[]> {
    try {
      return await apiClient.get<import('../types').ApplicationTimelineEvent[]>(`/applications/${id}/timeline`);
    } catch (err: any) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  async syncOutcomes(): Promise<import('../types').OutcomeSyncResult> {
    return await apiClient.post<import('../types').OutcomeSyncResult>('/applications/sync-outcomes');
  },
};
