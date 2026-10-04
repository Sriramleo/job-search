import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileCheck,
  Send,
  Calendar,
  Award,
  ArrowRight,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight,
  AlertCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { jobsApi, tasksApi, applicationsApi, analyticsApi, healthApi } from '../api';
import { Job, Task, Application } from '../types';
import { KPI } from '../components/ui/KPI';
import { Card } from '../components/ui/Card';
import { FitBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/FeedbackStates';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [actionQueueData, setActionQueueData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [
          jobsData,
          tasksData,
          appsData,
          overviewRes,
          dailyRes,
          actionQueueRes,
          alertsRes,
          healthRes,
        ] = await Promise.allSettled([
          jobsApi.getJobs(),
          tasksApi.getTasks(),
          applicationsApi.getApplications(),
          analyticsApi.getOverview(),
          analyticsApi.getDailySummary(),
          analyticsApi.getActionQueue(),
          analyticsApi.getAlerts(),
          healthApi.getSystemHealth(),
        ]);

        if (jobsData.status === 'fulfilled') setJobs(jobsData.value);
        if (tasksData.status === 'fulfilled') setTasks(tasksData.value);
        if (appsData.status === 'fulfilled') setApplications(appsData.value);
        if (overviewRes.status === 'fulfilled' && overviewRes.value) setOverview(overviewRes.value);
        if (dailyRes.status === 'fulfilled' && dailyRes.value) setDailySummary(dailyRes.value);
        if (actionQueueRes.status === 'fulfilled' && actionQueueRes.value) setActionQueueData(actionQueueRes.value);
        if (alertsRes.status === 'fulfilled' && (alertsRes.value as any)?.alerts) setAlerts((alertsRes.value as any).alerts);
        if (healthRes.status === 'fulfilled' && healthRes.value) setSystemHealth(healthRes.value);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} lines={1} type="card" />
          ))}
        </div>
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  // Top Opportunities (5–8 jobs)
  const topOpportunities = jobs.slice(0, 6);

  // Immediate Action Queue: use backend items if available, else tasks
  const actionItems: Array<{
    id: string;
    title: string;
    priority: string;
    entity: string;
    entityId: string;
    subtitle?: string;
    reason?: string;
  }> = actionQueueData?.items?.length
    ? actionQueueData.items.slice(0, 6).map((item: any, idx: number) => ({
        id: item.entityId || `item-${idx}`,
        title: item.title,
        priority: item.priority === 'high' ? 'High' : item.priority === 'medium' ? 'Medium' : 'Low',
        entity: item.entity,
        entityId: item.entityId,
        subtitle: item.source || item.type,
        reason: item.reason,
      }))
    : tasks
        .filter((t) => t.status !== 'Completed')
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          entity: 'Task',
          entityId: t.id,
          subtitle: t.companyName || 'General',
          reason: t.dueDate,
        }));

  // Handle action queue navigation
  const handleActionItemClick = (item: { entity: string; entityId: string }) => {
    const ent = item.entity.toLowerCase();
    if (ent === 'application') {
      navigate(`/applications/${item.entityId}`);
    } else if (ent === 'job') {
      navigate(`/jobs/${item.entityId}`);
    } else if (ent === 'contact') {
      navigate('/contacts');
    } else if (ent === 'communication' || ent === 'gmail') {
      navigate('/inbox');
    } else {
      navigate('/tasks');
    }
  };

  // Pipeline stage counts from overview or local apps
  const qualifiedJobsCount = overview?.totalQualifiedJobs ?? jobs.length;
  const readyAppsCount = overview?.applicationsAwaitingReview ?? applications.filter((a) => a.stage === 'Preparing').length;
  const appliedCount = overview?.applicationsSubmitted ?? applications.filter((a) => a.stage === 'Applied').length;
  const interviewsCount = overview?.interviews ?? 0;
  const offersCount = overview?.offers ?? 0;

  const pipelineCounts = {
    discovered: overview?.totalDiscoveredJobs ?? jobs.length,
    qualified: qualifiedJobsCount,
    preparing: readyAppsCount,
    applied: appliedCount,
    interview: interviewsCount,
    offer: offersCount,
  };


  const formatSalary = (min?: number, max?: number) => {
    if (!min || min <= 0 || !max || max <= 0) return 'Salary: Unknown';
    return `€${(min / 1000).toFixed(0)}K–€${(max / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-8">
      {/* 0. WHAT SHOULD I DO TODAY? OPERATIONAL BAR */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
              Today's Operational Directive
            </span>
            <Badge variant="purple" size="sm">
              {dailySummary?.itemsRequiringHumanAttention ?? actionItems.length} Actions Need Human Attention
            </Badge>
          </div>
          <p className="text-sm font-semibold text-slate-100">
            {readyAppsCount > 0
              ? `${readyAppsCount} application package(s) awaiting your review & manual external submission.`
              : 'Pipeline fully current. Review incoming recruiter signals and qualified opportunities.'}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span>
              Gmail Sync: <strong className="text-slate-200">{dailySummary?.gmailSyncStatus || (systemHealth?.status === 'healthy' ? 'Healthy' : 'Active')}</strong>
            </span>
            <span>·</span>
            <span>
              Agent Status: <strong className="text-slate-200">{dailySummary?.agentStatus || 'Ready'}</strong>
            </span>
            <span>·</span>
            <span>
              Qualified Today: <strong className="text-slate-200">{dailySummary?.jobsQualified ?? 0}</strong>
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {readyAppsCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/applications')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              Review Applications
            </Button>
          )}
        </div>
      </div>

      {/* 1. TOP KPI ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPI
          title="Qualified Jobs"
          value={qualifiedJobsCount}
          subtitle="€80K+ in Germany"
          icon={<Briefcase className="w-5 h-5" />}
          status="default"
        />
        <KPI
          title="Application Ready"
          value={readyAppsCount}
          subtitle="Awaiting submission"
          icon={<FileCheck className="w-5 h-5" />}
          status="purple"
        />
        <KPI
          title="Applied"
          value={appliedCount}
          subtitle="Active pipeline"
          icon={<Send className="w-5 h-5" />}
          status="default"
        />
        <KPI
          title="Interviews"
          value={interviewsCount}
          subtitle="Upcoming rounds"
          icon={<Calendar className="w-5 h-5" />}
          status="warning"
        />
        <KPI
          title="Offers"
          value={offersCount}
          subtitle="Final negotiation"
          icon={<Award className="w-5 h-5" />}
          status="success"
        />
      </div>

      {/* OPERATIONAL ALERTS (If any) */}
      {alerts.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Active Operational Alerts ({alerts.length})</span>
          </div>
          <div className="space-y-1 text-xs text-amber-800">
            {alerts.slice(0, 3).map((a, i) => (
              <div key={i} className="flex items-center justify-between">
                <span>{a.description}</span>
                <span className="text-[10px] text-amber-700 uppercase font-mono">{a.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MAIN CONTENT: Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Top Opportunities (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Top Opportunities
              </h2>
              <p className="text-xs text-[#64748B]">
                High-priority matches based on technical depth, salary band, and verified relocation
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/jobs')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              View All ({jobs.length})
            </Button>
          </div>

          <Card padding="none">
            {topOpportunities.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No data available</div>
            ) : (
              <div className="divide-y divide-slate-100">
              {topOpportunities.map((job) => {
                const getContextualAction = (j: Job) => {
                  const associatedApp = applications.find((a) => a.jobId === j.id);
                  if (associatedApp) {
                    return {
                      label: 'Review Application',
                      variant: 'primary' as const,
                      onClick: () => navigate(`/applications/${associatedApp.id}`),
                    };
                  }
                  return {
                    label: 'Prepare Draft',
                    variant: 'secondary' as const,
                    onClick: () => navigate(`/jobs/${j.id}`),
                  };
                };

                const action = getContextualAction(job);

                return (
                  <div
                    key={job.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="font-bold text-sm text-[#0F172A] hover:text-[#2563EB] cursor-pointer transition-colors"
                        >
                          {job.title}
                        </span>
                        <FitBadge fit={job.technicalFit} />
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#475569] flex-wrap">
                        <span className="font-semibold text-slate-800">{job.companyName}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{job.location}</span>
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-[#0F172A] tabular-nums">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#64748B] flex items-center gap-2 pt-0.5">
                        <span className="font-medium text-slate-500">Route:</span>
                        <span>{job.applicationRoute}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Button
                        variant={action.variant}
                        size="sm"
                        onClick={action.onClick}
                      >
                        {action.label}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </Card>

          {/* APPLICATION PIPELINE WIDGET */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-3">
              Application Pipeline Stage Progression
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'Discovered', count: pipelineCounts.discovered, color: 'text-slate-600 bg-slate-100' },
                { label: 'Qualified', count: pipelineCounts.qualified, color: 'text-blue-700 bg-blue-50' },
                { label: 'Preparing', count: pipelineCounts.preparing, color: 'text-amber-700 bg-amber-50' },
                { label: 'Applied', count: pipelineCounts.applied, color: 'text-blue-700 bg-blue-100' },
                { label: 'Interview', count: pipelineCounts.interview, color: 'text-emerald-700 bg-emerald-50' },
                { label: 'Offer', count: pipelineCounts.offer, color: 'text-green-800 bg-green-100' },
              ].map((stage) => (
                <div
                  key={stage.label}
                  onClick={() => navigate('/applications')}
                  className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs text-center cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <span className="text-[11px] font-medium text-[#64748B] block truncate">
                    {stage.label}
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-[#0F172A] tabular-nums mt-1 block">
                    {stage.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Action Queue & Recent Activity (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Queue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                  Action Queue
                </h2>
                <span className="text-[11px] text-[#64748B]">Immediate next steps requiring human action</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
                View All
              </Button>
            </div>

            {actionItems.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] text-center text-slate-500 text-xs">
                No data available
              </div>
            ) : (
              <div className="space-y-2.5">
                {actionItems.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleActionItemClick(t)}
                    className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-[#0F172A] group-hover:text-blue-600 transition-colors leading-snug">
                        {t.title}
                      </span>
                      <Badge variant={t.priority === 'High' ? 'red' : 'amber'} size="sm">
                        {t.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2">
                      <span className="font-medium text-slate-700">{t.subtitle}</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{t.reason || 'Pending'}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System & Search Snapshot */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                  System Health & Signals
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {systemHealth?.status === 'healthy' ? 'Healthy' : 'Online'}
                </span>
              </div>
            }
            padding="sm"
          >
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">Database</span>
                <span className="font-bold text-emerald-700">Connected</span>
              </div>
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">Gmail Integration</span>
                <span className="font-bold text-emerald-700">Read-Only Synced</span>
              </div>
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">AI Safety Boundary</span>
                <span className="font-bold text-blue-700">Human-in-the-Loop</span>
              </div>
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">Orchestrator</span>
                <span className="font-bold text-[#0F172A]">Idle (Ready)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
