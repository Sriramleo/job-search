import { store } from './store';
import { Company, Contact } from '../types';

export const companiesApi = {
  async getCompanies(search?: string): Promise<Company[]> {
    let companies = store.getCompanies();
    if (search) {
      const q = search.toLowerCase();
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.germanyLocations.some((loc) => loc.toLowerCase().includes(q))
      );
    }
    return companies;
  },

  async getCompany(id: string): Promise<Company | null> {
    const comp = store.getCompanyById(id);
    return comp || null;
  },
};

export const contactsApi = {
  async getContacts(relationshipFilter?: string): Promise<Contact[]> {
    let contacts = store.getContacts();
    if (relationshipFilter && relationshipFilter !== 'all') {
      contacts = contacts.filter((c) => c.relationship === relationshipFilter);
    }
    return contacts;
  },

  async getContact(id: string): Promise<Contact | null> {
    const contact = store.getContactById(id);
    return contact || null;
  },

  async addContactMessage(
    contactId: string,
    message: { type: 'LinkedIn' | 'Email'; direction: 'Outbound'; subject?: string; body: string }
  ): Promise<Contact> {
    return store.addContactMessage(contactId, message);
  },
};
