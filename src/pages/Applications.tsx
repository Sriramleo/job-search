import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Table as TableIcon,
  Kanban as KanbanIcon,
  Calendar,
  ArrowDownUp,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { applicationsApi } from '../api';
import { Application } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge, AutomationBadge, SubmissionMethodBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ApplicationKanban } from '../components/applications/ApplicationKanban';
import { CampaignDashboard } from '../components/campaign/CampaignDashboard';
import { LoadingSkeleton, EmptyState } from '../components/ui/FeedbackStates';

export const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'campaign'>('kanban');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [submissionFilter, setSubmissionFilter] = useState<'ALL' | 'AUTO' | 'MANUAL' | 'UNKNOWN'>('ALL');
  const [sortBy, setSortBy] = useState<'newest_submitted' | 'oldest_submitted' | 'method' | 'stage'>('newest_submitted');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationsApi.getApplications();
        setApplications(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  const isSubmitted = (app: Application) => {
    return Boolean(
      app.submittedAt ||
      app.appliedDate ||
      app.stage === 'Applied' ||
      app.stage === 'Recruiter Screen' ||
      app.stage === 'Interview' ||
      app.stage === 'Offer' ||
      app.stage === 'Rejected' ||
      app.stage === 'Withdrawn' ||
      app.stage === 'Closed' ||
      app.automationState === 'Submitted'
    );
  };

  const isAuto = (app: Application) => {
    const m = (app.submissionMethod || '').toUpperCase();
    return m === 'AUTO' || m.includes('PLAYWRIGHT') || m.includes('AUTOMAT');
  };

  const isManual = (app: Application) => {
    const m = (app.submissionMethod || '').toUpperCase();
    return m === 'MANUAL' || m.includes('PORTAL') || m.includes('EXTERNAL ATS') || m.includes('HUMAN');
  };

  const isUnknown = (app: Application) => {
    const m = (app.submissionMethod || '').toUpperCase();
    return m === 'UNKNOWN' || (isSubmitted(app) && !isAuto(app) && !isManual(app));
  };

  const hasOutcomeUnknown = applications.some(
    (a) => a.automationState === 'Outcome Unknown' || a.automationState === 'OUTCOME_UNKNOWN'
  );

  // Filter applications by outcome and submission method
  let filtered = applications.filter((app) => {
    // 1. Outcome filter
    if (outcomeFilter !== 'ALL') {
      if (outcomeFilter === 'INTERVIEW') {
        if (app.outcomeState !== 'INTERVIEW_INVITATION' && app.outcomeState !== 'INTERVIEW_SCHEDULED') {
          return false;
        }
      } else if (app.outcomeState !== outcomeFilter) {
        return false;
      }
    }

    // 2. Submission Method filter
    if (submissionFilter === 'AUTO') {
      return isAuto(app);
    }
    if (submissionFilter === 'MANUAL') {
      return isManual(app);
    }
    if (submissionFilter === 'UNKNOWN') {
      return isUnknown(app);
    }

    return true;
  });

  // Sort applications
  filtered.sort((a, b) => {
    if (sortBy === 'newest_submitted' || sortBy === 'oldest_submitted') {
      const tsA = a.submittedAt || a.appliedDate || '';
      const tsB = b.submittedAt || b.appliedDate || '';
      if (!tsA && !tsB) return 0;
      if (!tsA) return 1;
      if (!tsB) return -1;
      return sortBy === 'newest_submitted'
        ? tsB.localeCompare(tsA)
        : tsA.localeCompare(tsB);
    }

    if (sortBy === 'method') {
      const mA = a.submissionMethod || 'Z';
      const mB = b.submissionMethod || 'Z';
      return mA.localeCompare(mB);
    }

    if (sortBy === 'stage') {
      const order = ['Qualified', 'Preparing', 'Ready', 'Applied', 'Recruiter Screen', 'Interview', 'Offer', 'Rejected', 'Withdrawn', 'Closed'];
      return order.indexOf(a.stage) - order.indexOf(b.stage);
    }

    return 0;
  });

  const getOutcomeBadgeClass = (state?: string) => {
    switch (state) {
      case 'OFFER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_INVITATION':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ASSESSMENT':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'APPLICATION_RECEIVED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'RECRUITER_RESPONSE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REJECTION':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'NO_RESPONSE':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const outcomeTabs = [
    { id: 'ALL', label: 'All', count: applications.length },
    { id: 'NO_RESPONSE', label: 'No Response', count: applications.filter((a) => !a.outcomeState || a.outcomeState === 'NO_RESPONSE').length },
    { id: 'APPLICATION_RECEIVED', label: 'Confirmed', count: applications.filter((a) => a.outcomeState === 'APPLICATION_RECEIVED').length },
    { id: 'RECRUITER_RESPONSE', label: 'Recruiter', count: applications.filter((a) => a.outcomeState === 'RECRUITER_RESPONSE').length },
    { id: 'ASSESSMENT', label: 'Assessment', count: applications.filter((a) => a.outcomeState === 'ASSESSMENT').length },
    { id: 'INTERVIEW', label: 'Interview', count: applications.filter((a) => a.outcomeState === 'INTERVIEW_INVITATION' || a.outcomeState === 'INTERVIEW_SCHEDULED').length },
    { id: 'REJECTION', label: 'Rejected', count: applications.filter((a) => a.outcomeState === 'REJECTION').length },
    { id: 'OFFER', label: 'Offer', count: applications.filter((a) => a.outcomeState === 'OFFER').length },
  ];

  const submissionTabs = [
    { id: 'ALL', label: 'All Submissions', count: applications.length },
    { id: 'AUTO', label: 'Auto (ATS)', count: applications.filter(isAuto).length },
    { id: 'MANUAL', label: 'Manual Portal', count: applications.filter(isManual).length },
    { id: 'UNKNOWN', label: 'Unknown Method', count: applications.filter(isUnknown).length },
  ];

  const formatSubmissionDate = (app: Application) => {
    const raw = app.submittedAt || app.appliedDate;
    if (!raw) return '—';
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw.substring(0, 10);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return raw.substring(0, 10);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications Pipeline"
        subtitle="Manage and track application submissions from preparation to interview stages"
        actions={
          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <KanbanIcon className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('campaign')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'campaign'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Daily Campaign</span>
              </button>
            </div>

            {/* Total pipeline count badge */}
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 border border-slate-200">
              {filtered.length} of {applications.length} Records
            </span>
          </div>
        }
      />

      {/* Prominent Warning for Outcome Unknown */}
      {hasOutcomeUnknown && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-xs block">AMBIGUOUS SUBMISSION OUTCOME REGISTERED</span>
              <span className="text-xs text-amber-800">
                One or more applications has an unverified submission outcome. Automatic retries are strictly blocked. Requires human inspection and reconciliation.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
            ZERO RETRY ENFORCED
          </span>
        </div>
      )}

      {/* Submission Method & Sorting Control Bar */}
      {viewMode !== 'campaign' && (
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Submission Method Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Method:
              </span>
              {submissionTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSubmissionFilter(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    submissionFilter === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      submissionFilter === tab.id ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="flex items-center gap-1 text-slate-500 font-medium text-[11px]">
                <ArrowDownUp className="w-3.5 h-3.5" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="newest_submitted">Most Recently Submitted</option>
                <option value="oldest_submitted">Oldest Submitted First</option>
                <option value="method">Submission Method</option>
                <option value="stage">Pipeline Stage</option>
              </select>
            </div>
          </div>

          {/* Clarity note: readiness != submission */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              <strong>Note:</strong> Submission Method reflects actual employer-side submission proof.
              <code className="mx-1 px-1 py-0.2 bg-slate-200/70 rounded text-[10px] font-mono text-slate-700">AUTO_APPLY_READY</code>
              is an evaluation readiness state, not proof of automated submission.
            </span>
          </div>
        </div>
      )}

      {/* Employer Outcome Filter Bar */}
      {viewMode !== 'campaign' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {outcomeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOutcomeFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                outcomeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  outcomeFilter === tab.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main View Area */}
      {viewMode === 'campaign' ? (
        <CampaignDashboard />
      ) : viewMode === 'kanban' ? (
        <ApplicationKanban applications={filtered} />
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              title="No applications match filters"
              description="No applications currently match the selected submission method and outcome filters."
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Submission Method</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Employer Outcome</th>
                  <th className="py-3 px-4">Automation State</th>
                  <th className="py-3 px-4">Next Action</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-sm text-[#0F172A] block leading-tight">
                        {app.jobTitle}
                      </span>
                      <span className="text-[11px] text-[#64748B] font-medium">
                        {app.companyName} · {app.location} · {app.salaryRange}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge stage={app.stage} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SubmissionMethodBadge method={app.submissionMethod} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#475569] font-medium tabular-nums">
                      {formatSubmissionDate(app)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getOutcomeBadgeClass(
                          app.outcomeState
                        )}`}
                      >
                        {app.outcomeState || 'NO_RESPONSE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <AutomationBadge state={app.automationState} />
                        {app.approvedForSubmissionAt && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-2.5 h-2.5" /> Approved
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569] max-w-xs">
                      <span className="line-clamp-1">{app.nextAction}</span>
                      <span className="text-[10px] text-slate-400 block">Due: {app.nextActionDueDate}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/applications/${app.id}`);
                        }}
                      >
                        Workspace
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
