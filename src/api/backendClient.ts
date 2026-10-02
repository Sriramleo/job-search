/// <reference types="vite/client" />
/**
 * Backend API HTTP Client for German Job Hunt
 * Connects to the FastAPI backend when VITE_API_BASE_URL is provided,
 * while maintaining 100% contract compatibility with the frontend.
 */


import {
  Job,
  Company,
  Contact,
  Application,
  Document,
  Interview,
  Task,
  ResearchEvidence,
  Communication,
  Candidate,
  CandidateEvidence,
  AutomationRun,
  AIUsage,
} from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const isBackendConnected = (): boolean => {
  return Boolean(API_BASE_URL && API_BASE_URL.trim() !== '');
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API Error [${response.status}] ${response.statusText}: ${errorText}`);
  }

  return response.json();
}

export const backendJobsApi = {
  async getJobs(params?: Record<string, any>): Promise<Job[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.search) query.append('search', params.search);
      if (params.location && params.location !== 'all') query.append('location', params.location);
      if (params.status && params.status !== 'all') query.append('status', params.status);
      if (params.technicalFit && params.technicalFit !== 'all') query.append('fit', params.technicalFit);
      if (params.role) query.append('role', params.role);
    }
    const qs = query.toString();
    return apiRequest<Job[]>(`/jobs${qs ? `?${qs}` : ''}`);
  },

  async getJob(id: string): Promise<Job | null> {
    try {
      return await apiRequest<Job>(`/jobs/${id}`);
    } catch {
      return null;
    }
  },

  async updateJob(id: string, update: Partial<Job>): Promise<Job> {
    return apiRequest<Job>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    });
  },
};

export const backendCompaniesApi = {
  async getCompanies(search?: string): Promise<Company[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest<Company[]>(`/companies${qs}`);
  },

  async getCompany(id: string): Promise<Company | null> {
    try {
      return await apiRequest<Company>(`/companies/${id}`);
    } catch {
      return null;
    }
  },
};

export const backendContactsApi = {
  async getContacts(relationshipFilter?: string): Promise<Contact[]> {
    const qs = relationshipFilter && relationshipFilter !== 'all'
      ? `?relationship=${encodeURIComponent(relationshipFilter)}`
      : '';
    return apiRequest<Contact[]>(`/contacts${qs}`);
  },

  async getContact(id: string): Promise<Contact | null> {
    try {
      return await apiRequest<Contact>(`/contacts/${id}`);
    } catch {
      return null;
    }
  },

  async addContactMessage(
    contactId: string,
    message: { type: 'LinkedIn' | 'Email'; direction: 'Outbound'; subject?: string; body: string }
  ): Promise<Contact> {
    return apiRequest<Contact>(`/contacts/${contactId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },
};

export const backendApplicationsApi = {
  async getApplications(): Promise<Application[]> {
    return apiRequest<Application[]>('/applications');
  },

  async getApplication(id: string): Promise<Application | null> {
    try {
      return await apiRequest<Application>(`/applications/${id}`);
    } catch {
      return null;
    }
  },

  async updateApplication(id: string, update: Partial<Application>): Promise<Application> {
    return apiRequest<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    });
  },

  async attestClaim(
    applicationId: string,
    claimId: string,
    attestationNotes?: string
  ): Promise<Application> {
    return apiRequest<Application>(`/applications/${applicationId}/claims/${claimId}/attest`, {
      method: 'POST',
      body: JSON.stringify({ attestationNotes }),
    });
  },

  async getWorkspace(applicationId: string): Promise<any> {
    return apiRequest<any>(`/applications/${applicationId}/workspace`);
  },
};

export const backendDocumentsApi = {
  async getDocuments(typeFilter?: string): Promise<Document[]> {
    const qs = typeFilter && typeFilter !== 'all' ? `?type=${encodeURIComponent(typeFilter)}` : '';
    return apiRequest<Document[]>(`/documents${qs}`);
  },

  async getDocument(id: string): Promise<Document | null> {
    try {
      return await apiRequest<Document>(`/documents/${id}`);
    } catch {
      return null;
    }
  },

  async updateDocument(id: string, update: Partial<Document>): Promise<Document> {
    return apiRequest<Document>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    });
  },
};

export const backendInterviewsApi = {
  async getInterviews(): Promise<Interview[]> {
    return apiRequest<Interview[]>('/interviews');
  },
};

export const backendTasksApi = {
  async getTasks(): Promise<Task[]> {
    return apiRequest<Task[]>('/tasks');
  },

  async updateTask(id: string, update: Partial<Task>): Promise<Task> {
    return apiRequest<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    });
  },

  async createTask(newTask: Omit<Task, 'id'>): Promise<Task> {
    return apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(newTask),
    });
  },
};

export const backendResearchApi = {
  async getResearchEvidence(categoryFilter?: string): Promise<ResearchEvidence[]> {
    const qs = categoryFilter && categoryFilter !== 'all' ? `?category=${encodeURIComponent(categoryFilter)}` : '';
    return apiRequest<ResearchEvidence[]>(`/research/evidence${qs}`);
  },
};

export const backendCommunicationsApi = {
  async getCommunications(folder?: string): Promise<Communication[]> {
    const qs = folder && folder !== 'All' ? `?folder=${encodeURIComponent(folder)}` : '';
    return apiRequest<Communication[]>(`/communications${qs}`);
  },

  async markAsRead(id: string): Promise<Communication> {
    return apiRequest<Communication>(`/communications/${id}`, {
      method: 'PATCH',
    });
  },
};

export const backendCandidateApi = {
  async getCandidate(): Promise<Candidate> {
    return apiRequest<Candidate>('/candidates');
  },

  async updateCandidate(update: Partial<Candidate>): Promise<Candidate> {
    return apiRequest<Candidate>('/candidates/cand-sriram', {
      method: 'PATCH',
      body: JSON.stringify(update),
    });
  },

  async getCandidateEvidence(): Promise<CandidateEvidence[]> {
    return apiRequest<CandidateEvidence[]>('/candidates/evidence');
  },
};

export const backendAutomationApi = {
  async getAutomationRuns(): Promise<AutomationRun[]> {
    return apiRequest<AutomationRun[]>('/system/automation-runs');
  },

  async toggleAutomation(id: string): Promise<AutomationRun> {
    return apiRequest<AutomationRun>(`/system/automation-runs/${id}/toggle`, {
      method: 'POST',
    });
  },
};

export const backendAnalyticsApi = {
  async getAIUsage(): Promise<AIUsage[]> {
    return apiRequest<AIUsage[]>('/system/ai-usage');
  },

  async getAnalyticsData() {
    return apiRequest<any>('/analytics/summary');
  },
};
