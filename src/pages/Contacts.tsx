import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  ExternalLink,
  MessageSquare,
  Calendar,
  AlertCircle,
  Plus,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { contactsApi, outreachApi } from '../api';
import { Contact, ContactRelationship, OutreachQueueItem, SuppressionRecord } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { SearchBar } from '../components/common/SearchBar';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ContactDrawer } from '../components/contacts/ContactDrawer';
import { OutreachQueueTable } from '../components/contacts/OutreachQueueTable';
import { OutreachDrawer } from '../components/contacts/OutreachDrawer';
import { SuppressionTable } from '../components/contacts/SuppressionTable';
import { LoadingSkeleton, EmptyState } from '../components/ui/FeedbackStates';

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [outreachQueue, setOutreachQueue] = useState<OutreachQueueItem[]>([]);
  const [suppressions, setSuppressions] = useState<SuppressionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedOutreach, setSelectedOutreach] = useState<OutreachQueueItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const [contactsData, queueData, suppData] = await Promise.all([
        contactsApi.getContacts(),
        outreachApi.getQueue().catch(() => []),
        outreachApi.getSuppressions().catch(() => []),
      ]);
      setContacts(contactsData);
      setOutreachQueue(queueData);
      setSuppressions(suppData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSendMessage = async (contactId: string, text: string, type: 'LinkedIn' | 'Email') => {
    await contactsApi.addContactMessage(contactId, {
      type,
      direction: 'Outbound',
      body: text,
    });
    fetchAllData();
    const updated = await contactsApi.getContact(contactId);
    setSelectedContact(updated);
  };

  const handleApproveOutreach = async (id: string) => {
    const updated = await outreachApi.approveDraft(id);
    setOutreachQueue((prev) => prev.map((item) => (item.id === id ? updated : item)));
    if (selectedOutreach?.id === id) {
      setSelectedOutreach(updated);
    }
  };

  const handleRejectOutreach = async (id: string, reason?: string) => {
    const updated = await outreachApi.rejectDraft(id, reason);
    setOutreachQueue((prev) => prev.map((item) => (item.id === id ? updated : item)));
    if (selectedOutreach?.id === id) {
      setSelectedOutreach(updated);
    }
  };

  const handleAddSuppression = async (targetType: 'email' | 'domain', targetValue: string, reason?: string) => {
    await outreachApi.addSuppression(targetType, targetValue, reason);
    const updatedSupps = await outreachApi.getSuppressions();
    setSuppressions(updatedSupps);
  };

  const handleDeleteSuppression = async (id: string) => {
    await outreachApi.deleteSuppression(id);
    setSuppressions((prev) => prev.filter((s) => s.id !== id));
  };

  const filteredContacts = contacts.filter((c) => {
    if (activeTab === 'recruiters' && c.relationship !== 'Recruiter') return false;
    if (activeTab === 'hiringManagers' && c.relationship !== 'Hiring Manager') return false;
    if (activeTab === 'referrals' && c.relationship !== 'Potential Referral' && c.relationship !== 'Former Colleague') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        (c.linkedJobTitle && c.linkedJobTitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredOutreach = outreachQueue.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.contactName.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        item.targetJobTitle.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network & Outreach Management"
        subtitle="Manage relationships with German recruiters, hiring managers, and review automated outreach drafts"
      />

      {/* Tabs View Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs
          variant="pills"
          tabs={[
            { id: 'all', label: 'All Contacts', count: contacts.length },
            {
              id: 'recruiters',
              label: 'Recruiters',
              count: contacts.filter((c) => c.relationship === 'Recruiter').length,
            },
            {
              id: 'hiringManagers',
              label: 'Hiring Managers',
              count: contacts.filter((c) => c.relationship === 'Hiring Manager').length,
            },
            {
              id: 'referrals',
              label: 'Potential Referrals',
              count: contacts.filter(
                (c) => c.relationship === 'Potential Referral' || c.relationship === 'Former Colleague'
              ).length,
            },
            {
              id: 'outreachQueue',
              label: 'Outreach Queue (Phase 044)',
              count: outreachQueue.length,
            },
            {
              id: 'suppressions',
              label: 'Suppression & Opt-Outs',
              count: suppressions.length,
            },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search contacts, company, role..."
          className="w-full sm:max-w-xs"
        />
      </div>

      {/* Mode Notices */}
      {activeTab === 'outreachQueue' ? (
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>PHASE 044 DRAFT & RESEARCH MODE:</strong> Tailored recruiter drafts are generated from verified candidate evidence. Outbound automated emailing is strictly disabled by invariant. Approvals store human verification audit records.
            </span>
          </div>
        </div>
      ) : activeTab === 'suppressions' ? null : (
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>HUMAN ACTION STANDARD:</strong> All LinkedIn messages, connection requests, and referral dialogues must be reviewed and sent manually. No automated LinkedIn outreach bots.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'outreachQueue' ? (
        <OutreachQueueTable
          items={filteredOutreach}
          onSelect={(item) => setSelectedOutreach(item)}
          onApprove={handleApproveOutreach}
          onReject={handleRejectOutreach}
        />
      ) : activeTab === 'suppressions' ? (
        <SuppressionTable
          items={suppressions}
          onAdd={handleAddSuppression}
          onDelete={handleDeleteSuppression}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          {filteredContacts.length === 0 ? (
            <EmptyState
              title="No contacts found"
              description="No professional contacts in this view. As you network with recruiters and hiring teams, they will be listed here."
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-3 px-4 w-[22%]">Name & Title</th>
                  <th className="py-3 px-4 w-[16%]">Company</th>
                  <th className="py-3 px-4 w-[14%]">Relationship</th>
                  <th className="py-3 px-4 w-[18%]">Linked Opportunity</th>
                  <th className="py-3 px-4 w-[12%]">Last Contact</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((cnt) => (
                  <tr
                    key={cnt.id}
                    onClick={() => setSelectedContact(cnt)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                        {cnt.name}
                      </div>
                      <div className="text-[11px] text-[#64748B] line-clamp-1">{cnt.role}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{cnt.companyName}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={cnt.relationship === 'Recruiter' ? 'blue' : 'purple'}>
                        {cnt.relationship}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      {cnt.linkedJobTitle ? (
                        <span className="font-medium text-slate-700 block truncate max-w-[200px]" title={cnt.linkedJobTitle}>
                          {cnt.linkedJobTitle}
                        </span>
                      ) : (
                        <span className="text-slate-400">General</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                      {cnt.lastContactDate || 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(cnt);
                        }}
                      >
                        Open Drawer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Selected Contact Slide-over Drawer */}
      <ContactDrawer
        contact={selectedContact}
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        onSendMessage={handleSendMessage}
      />

      {/* Phase 044 Outreach Draft Drawer */}
      <OutreachDrawer
        item={selectedOutreach}
        isOpen={!!selectedOutreach}
        onClose={() => setSelectedOutreach(null)}
        onApprove={handleApproveOutreach}
        onReject={handleRejectOutreach}
        onSuppress={async (type, val, reason) => {
          await handleAddSuppression(type, val, reason);
          setSelectedOutreach(null);
        }}
      />
    </div>
  );
};
