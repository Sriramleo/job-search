import { apiClient } from './client';
import { Document } from '../types';

export interface DocumentFilterParams {
  type?: string;
  jobId?: string;
  applicationId?: string;
  limit?: number;
  skip?: number;
}

export const documentsApi = {
  async getDocuments(filter?: string | DocumentFilterParams): Promise<Document[]> {
    const params: Record<string, any> = {};
    if (typeof filter === 'string') {
      if (filter && filter !== 'all') params.type = filter;
    } else if (filter) {
      if (filter.type && filter.type !== 'all') params.type = filter.type;
      if (filter.jobId) params.jobId = filter.jobId;
      if (filter.applicationId) params.applicationId = filter.applicationId;
      if (filter.limit) params.limit = filter.limit;
      if (filter.skip) params.skip = filter.skip;
    }
    return await apiClient.get<Document[]>('/documents', { params });
  },

  async getDocument(id: string): Promise<Document | null> {
    try {
      return await apiClient.get<Document>(`/documents/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async updateDocument(id: string, update: Partial<Document>): Promise<Document> {
    return await apiClient.patch<Document>(`/documents/${id}`, update);
  },

  async createDocument(doc: Partial<Document>): Promise<Document> {
    return await apiClient.post<Document>('/documents', doc);
  },
};

