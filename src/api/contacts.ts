import { apiClient } from './client';
import { Contact } from '../types';

export interface ContactFilterParams {
  relationship?: string;
  companyId?: string;
  search?: string;
  limit?: number;
  skip?: number;
}

export const contactsApi = {
  async getContacts(filter?: string | ContactFilterParams): Promise<Contact[]> {
    const params: Record<string, any> = {};
    if (typeof filter === 'string') {
      if (filter && filter !== 'all') params.relationship = filter;
    } else if (filter) {
      if (filter.relationship && filter.relationship !== 'all') params.relationship = filter.relationship;
      if (filter.companyId) params.companyId = filter.companyId;
      if (filter.search) params.search = filter.search;
      if (filter.limit) params.limit = filter.limit;
      if (filter.skip) params.skip = filter.skip;
    }
    return await apiClient.get<Contact[]>('/contacts', { params });
  },

  async getContact(id: string): Promise<Contact | null> {
    try {
      return await apiClient.get<Contact>(`/contacts/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async createContact(contact: Partial<Contact>): Promise<Contact> {
    return await apiClient.post<Contact>('/contacts', contact);
  },

  async updateContact(id: string, update: Partial<Contact>): Promise<Contact> {
    return await apiClient.patch<Contact>(`/contacts/${id}`, update);
  },

  async addContactMessage(
    contactId: string,
    message: { type: 'LinkedIn' | 'Email'; direction: 'Outbound'; subject?: string; body: string }
  ): Promise<Contact> {
    return await apiClient.post<Contact>(`/contacts/${contactId}/messages`, message);
  },

  async verifyContact(
    contactId: string,
    payload: { verifiedBy?: string; verificationNotes?: string; relationshipConfirmed?: boolean } = {}
  ): Promise<Contact> {
    return await apiClient.post<Contact>(`/contacts/${contactId}/verify`, {
      verifiedBy: payload.verifiedBy || 'candidate',
      verificationNotes: payload.verificationNotes || 'Verified by human in UI',
      relationshipConfirmed: payload.relationshipConfirmed ?? true,
    });
  },
};

