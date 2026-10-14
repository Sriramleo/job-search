import React, { useEffect, useState } from 'react';
import {
  Send,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  Globe,
  Plus,
  RefreshCw,
  Clock,
  Building,
  UserCheck,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { outreachApi, jobsApi } from '../api';
import {
  OutreachQueueItem,
  OutreachConfig,
  SuppressionRecord,
  DailyQuotaLease,
  OutreachDraftUpdate,
  Job,
} from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { OutreachDrawer } from '../components/contacts/OutreachDrawer';
import { SuppressionTable } from '../components/contacts/SuppressionTable';
import { LoadingSkeleton, EmptyState } from '../components/ui/FeedbackStates';

export const Outreach: React.FC = () => {
  const [items, setItems] = useState<OutreachQueueItem[]>([]);
  const [config, setConfig] = useState<OutreachConfig | null>(null);
  const [lease, setLease] = useState<DailyQuotaLease | null>(null);
  const [suppressions, setSuppressions] = useState<SuppressionRecord[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<OutreachQueueItem | null>(null);
  const [isSuppressionModalOpen, setIsSuppressionModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedJobIdForGen, setSelectedJobIdForGen] = useState('');
  const [genContactName, setGenContactName] = useState('');
  const [genContactRole, setGenContactRole] = useState('');
  const [genEmail, setGenEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setErrorBanner(null);
      const [queueData, configData, leaseData, suppData, jobsData] = await Promise.all([
        outreachApi.getQueue().catch(() => []),
        outreachApi.getConfig().catch(() => null),
        outreachApi.getQuotaLease().catch(() => null),
        outreachApi.getSuppressions().catch(() => []),
        jobsApi.getJobs({ limit: 50 }).catch(() => []),
      ]);
      setItems(queueData);
      setConfig(configData);
      setLease(leaseData);
      setSuppressions(suppData);
      setActiveJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed fetching outreach data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleApprove = async (id: string) => {
    const updated = await outreachApi.approveDraft(id);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    if (selectedItem?.id === id) {
      setSelectedItem(updated);
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    const updated = await outreachApi.rejectDraft(id, reason);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    if (selectedItem?.id === id) {
      setSelectedItem(updated);
    }
  };

  const handleUpdateDraft = async (id: string, updates: OutreachDraftUpdate) => {
    const updated = await outreachApi.updateDraft(id, updates);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    if (selectedItem?.id === id) {
      setSelectedItem(updated);
    }
  };

  const handleSuppress = async (targetType: 'email' | 'domain', targetValue: string, reason?: string) => {
    await outreachApi.addSuppression(targetType, targetValue, reason);
    const updatedSupps = await outreachApi.getSuppressions();
    setSuppressions(updatedSupps);
    fetchAll();
  };

  const handleDeleteSuppression = async (id: string) => {
    await outreachApi.deleteSuppression(id);
    setSuppressions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobIdForGen) return;
    setIsGenerating(true);
    try {
      const created = await outreachApi.generateDraft({
        jobId: selectedJobIdForGen,
        contactName: genContactName || undefined,
        contactRole: genContactRole || undefined,
        email: genEmail || undefined,
      });
      setItems((prev) => [created, ...prev]);
      setSelectedItem(created);
      setIsGenerateModalOpen(false);
      setGenContactName('');
      setGenContactRole('');
      setGenEmail('');
      const leaseData = await outreachApi.getQuotaLease();
      setLease(leaseData);
    } catch (err: any) {
      alert(`Could not generate outreach draft: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === 'needsReview' && item.status !== 'Needs Review') return false;
    if (activeTab === 'draftReady' && item.status !== 'Draft Ready') return false;
    if (activeTab === 'approved' && item.status !== 'Approved') return false;
    if (activeTab === 'optedOut' && item.status !== 'Opted Out' && item.status !== 'Suppressed') return false;

    if (channelFilter !== 'all' && item.channel.toLowerCase() !== channelFilter.toLowerCase()) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.contactName.toLowerCase().includes(q);
      const matchCompany = item.companyName.toLowerCase().includes(q);
      const matchRole = item.contactRole.toLowerCase().includes(q);
      const matchJob = item.targetJobTitle.toLowerCase().includes(q);
      return matchName || matchCompany || matchRole || matchJob;
    }
    return true;
  });

  if (isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Recruiter & Hiring Manager Outreach Studio"
          subtitle="Fact-grounded outreach drafting and human review queue for Germany DevOps & Platform roles"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSuppressionModalOpen(true)}
            className="text-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Suppression List ({suppressions.length})
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGenerateModalOpen(true)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Research & Draft
          </Button>
        </div>
      </div>

      {/* Safety Boundary Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <div className="font-semibold text-blue-950 flex items-center gap-2">
            Phase 047 Safety Policy: Research & Review Only
            <span className="px-2 py-0.5 bg-blue-200/70 text-blue-900 rounded font-mono text-[11px]">
              OUTBOUND SENDING HARD-DISABLED
            </span>
          </div>
          <p className="mt-1">
            This module generates tailored, anti-hallucination drafts strictly grounded in candidate evidence.
            No automated emails are transmitted. Approving a draft confirms preparation quality for manual recruiter contact.
          </p>
        </div>
      </div>

      {/* Quota & Operational Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary-500" /> Daily Draft Quota
          </div>
          <div className="text-lg font-bold text-slate-900">
            {lease?.draftsReserved ?? 0} / {lease?.dailyCap ?? 20}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary-600 h-1.5 rounded-full"
              style={{
                width: `${Math.min(100, (((lease?.draftsReserved ?? 0) / (lease?.dailyCap ?? 20)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-indigo-500" /> Company Cooldown
          </div>
          <div className="text-lg font-bold text-slate-900">
            {config?.companyCooldownDays ?? 14} Days
          </div>
          <div className="text-[11px] text-slate-400">Strict anti-spam policy</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Contact Cooldown
          </div>
          <div className="text-lg font-bold text-slate-900">
            {config?.contactCooldownDays ?? 30} Days
          </div>
          <div className="text-[11px] text-slate-400">Per-recruiter rest interval</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-500" /> Business Hours
          </div>
          <div className="text-lg font-bold text-slate-900">09:00 – 17:00</div>
          <div className="text-[11px] text-slate-400">Europe/Berlin timezone</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs
          variant="pills"
          tabs={[
            { id: 'all', label: 'All Items', count: items.length },
            {
              id: 'needsReview',
              label: 'Needs Review',
              count: items.filter((i) => i.status === 'Needs Review').length,
            },
            {
              id: 'draftReady',
              label: 'Draft Ready',
              count: items.filter((i) => i.status === 'Draft Ready').length,
            },
            {
              id: 'approved',
              label: 'Approved',
              count: items.filter((i) => i.status === 'Approved').length,
            },
            {
              id: 'optedOut',
              label: 'Discarded / Suppressed',
              count: items.filter((i) => i.status === 'Opted Out' || i.status === 'Suppressed').length,
            },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts, roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
      </div>

      {/* Main Outreach Table */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Send className="w-8 h-8 stroke-[1.5]" />}
          title="No outreach drafts found"
          description="Use 'Research & Draft' to prepare tailored recruiter introductions for qualified Germany jobs."
          actionText="Research First Contact"
          onAction={() => setIsGenerateModalOpen(true)}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Contact & Role</th>
                <th className="py-3 px-4">Company & Target Job</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Evidence Confidence</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.contactName}</div>
                    <div className="text-[11px] text-slate-500">{item.contactRole}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{item.companyName}</div>
                    <div className="text-[11px] text-slate-500">{item.targetJobTitle}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 font-medium">
                      {item.channel === 'Email' ? (
                        <>
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-800">Email</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-blue-800">LinkedIn</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={item.evidence.confidence === 'HIGH' ? 'green' : 'amber'}>
                      {item.evidence.confidence}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        item.status === 'Approved'
                          ? 'green'
                          : item.status === 'Needs Review'
                          ? 'amber'
                          : item.status === 'Opted Out' || item.status === 'Suppressed'
                          ? 'red'
                          : 'blue'
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="text-xs h-7"
                    >
                      Review Draft
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Outreach Review & Editor Drawer */}
      <OutreachDrawer
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onSuppress={handleSuppress}
        onUpdateDraft={handleUpdateDraft}
      />

      {/* Suppression List Management Modal */}
      <Modal
        isOpen={isSuppressionModalOpen}
        onClose={() => setIsSuppressionModalOpen(false)}
        title="Compliance & Opt-Out Suppression List"
        size="lg"
      >
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          <SuppressionTable
            items={suppressions}
            onAdd={handleSuppress}
            onDelete={handleDeleteSuppression}
          />
        </div>
      </Modal>

      {/* Research & Draft Generation Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-primary-600" /> Research & Generate Outreach Draft
              </h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Target Qualified Germany Job <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedJobIdForGen}
                  onChange={(e) => setSelectedJobIdForGen(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select an active role...</option>
                  {activeJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} @ {j.companyName} ({j.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Contact Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sandra Müller (leave blank for recruiting team)"
                  value={genContactName}
                  onChange={(e) => setGenContactName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Contact Role (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Technical Recruiter"
                  value={genContactRole}
                  onChange={(e) => setGenContactRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Verified Business Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="Only if supported by public official evidence"
                  value={genEmail}
                  onChange={(e) => setGenEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                />
                <span className="text-[10px] text-slate-400">
                  Unverified emails are automatically flagged for operator review.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsGenerateModalOpen(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isGenerating || !selectedJobIdForGen}
                >
                  {isGenerating ? 'Generating...' : 'Generate Grounded Draft'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
