import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Table as TableIcon,
  Kanban as KanbanIcon,
  Plus,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { applicationsApi } from '../api';
import { Application } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { StatusBadge, AutomationBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ApplicationKanban } from '../components/applications/ApplicationKanban';
import { CampaignDashboard } from '../components/campaign/CampaignDashboard';
import { LoadingSkeleton, EmptyState } from '../components/ui/FeedbackStates';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'campaign'>('kanban');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
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

  const hasOutcomeUnknown = applications.some(
    (a) => a.automationState === 'Outcome Unknown' || a.automationState === 'OUTCOME_UNKNOWN'
  );

  const filteredApplications = applications.filter((app) => {
    if (outcomeFilter === 'ALL') return true;
    if (outcomeFilter === 'INTERVIEW') {
      return (
        app.outcomeState === 'INTERVIEW_INVITATION' ||
        app.outcomeState === 'INTERVIEW_SCHEDULED'
      );
    }
    return app.outcomeState === outcomeFilter;
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

            <Button
              variant="primary"
              size="sm"
              disabled={applications.length === 0}
              onClick={() => applications.length > 0 && navigate(`/applications/${applications[0].id}`)}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              Open Active Workspace
            </Button>
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

      {/* Outcome Intelligence Filter Bar */}
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
        <ApplicationKanban applications={filteredApplications} />
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          {filteredApplications.length === 0 ? (
            <EmptyState
              title="No applications match filter"
              description="No applications currently match the selected outcome filter."
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Employer Outcome</th>
                  <th className="py-3 px-4">Salary Range</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Automation State</th>
                  <th className="py-3 px-4">Next Action</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
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
                        {app.companyName} · {app.location}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge stage={app.stage} />
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
                    <td className="py-3.5 px-4 text-[#0F172A] font-medium tabular-nums">
                      {app.salaryRange}
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">{app.route}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <AutomationBadge state={app.automationState} />
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
