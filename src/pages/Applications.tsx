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
import { LoadingSkeleton, EmptyState } from '../components/ui/FeedbackStates';

export const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
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
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/applications/app-zalando-01')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              Open Active Workspace
            </Button>
          </div>
        }
      />

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        <ApplicationKanban applications={applications} />
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Salary Range</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Automation State</th>
                <th className="py-3 px-4">Next Action</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
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
        </div>
      )}
    </div>
  );
};
