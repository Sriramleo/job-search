import { apiClient } from './client';
import { store } from './store';
import { Communication } from '../types';

export interface CommunicationFilterParams {
  folder?: string;
  jobId?: string;
  applicationId?: string;
  limit?: number;
  skip?: number;
}

export interface GmailMessageFilterParams {
  contactId?: string;
  companyId?: string;
  jobId?: string;
  applicationId?: string;
  communicationId?: string;
  matchStatus?: string;
  limit?: number;
  skip?: number;
}

export const inboxApi = {
  async getCommunications(folderFilter?: string | CommunicationFilterParams): Promise<Communication[]> {
    try {
      const params: Record<string, any> = {};
      if (typeof folderFilter === 'string') {
        if (folderFilter && folderFilter !== 'All') params.folder = folderFilter;
      } else if (folderFilter) {
        if (folderFilter.folder && folderFilter.folder !== 'All') params.folder = folderFilter.folder;
        if (folderFilter.jobId) params.jobId = folderFilter.jobId;
        if (folderFilter.applicationId) params.applicationId = folderFilter.applicationId;
        if (folderFilter.limit) params.limit = folderFilter.limit;
        if (folderFilter.skip) params.skip = folderFilter.skip;
      }
      return await apiClient.get<Communication[]>('/communications', { params });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      console.warn('Communications API call failed, falling back to mock store:', err);
      let items = store.getCommunications();
      const folder = typeof folderFilter === 'string' ? folderFilter : folderFilter?.folder;
      if (folder && folder !== 'All') {
        items = items.filter((c) => c.folder === folder);
      }
      return items;
    }
  },

  async markAsRead(id: string): Promise<Communication> {
    try {
      return await apiClient.patch<Communication>(`/communications/${id}`);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.markCommunicationAsRead(id);
    }
  },

  // Phase 8 Gmail endpoints
  async getGmailStatus() {
    try {
      return await apiClient.get('/gmail/status');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return { status: 'disconnected', is_connected: false, connected_email: null };
    }
  },

  async getGmailMessages(params?: GmailMessageFilterParams) {
    try {
      return await apiClient.get('/gmail/messages', { params: params as any });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return [];
    }
  },

  async syncGmail(options?: { fullSync?: boolean; maxMessages?: number }) {
    return await apiClient.post('/gmail/sync', options || {});
  },

  async associateGmailMessage(
    messageId: string,
    association: {
      contactId?: string;
      companyId?: string;
      jobId?: string;
      applicationId?: string;
      notes?: string;
    }
  ) {
    return await apiClient.post(`/gmail/messages/${messageId}/associate`, association);
  },
};

export const communicationsApi = inboxApi;
