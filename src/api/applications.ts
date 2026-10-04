import { apiClient } from './client';
import { Application } from '../types';

export interface ApplicationFilterParams {
  stage?: string;
  route?: string;
  automationState?: string;
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

  async getWorkspace(applicationId: string) {
    try {
      return await apiClient.get(`/applications/${applicationId}/workspace`);
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
};
