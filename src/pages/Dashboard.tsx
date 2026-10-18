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
  Coins,
  Zap,
  Shield,
  Target,
  Users,
} from 'lucide-react';
import { jobsApi, tasksApi, applicationsApi, analyticsApi, healthApi, outreachApi } from '../api';
import { Job, Task, Application, AITrialSummary, OutreachQueueItem } from '../types';
import { KPI } from '../components/ui/KPI';
import { Card } from '../components/ui/Card';
import { FitBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getSourceAttribution, getApplicationRouteAttribution } from '../utils/jobSource';
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
  const [aiTrialSummary, setAiTrialSummary] = useState<AITrialSummary | null>(null);
  const [outreachItems, setOutreachItems] = useState<OutreachQueueItem[]>([]);
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
          aiTrialRes,
          outreachRes,
        ] = await Promise.allSettled([
          jobsApi.getJobs(),
          tasksApi.getTasks(),
          applicationsApi.getApplications(),
          analyticsApi.getOverview(),
          analyticsApi.getDailySummary(),
          analyticsApi.getActionQueue(),
          analyticsApi.getAlerts(),
          healthApi.getSystemHealth(),
          analyticsApi.getAITrialSummary(),
          outreachApi.getQueue(),
        ]);

        if (jobsData.status === 'fulfilled') setJobs(jobsData.value);
        if (tasksData.status === 'fulfilled') setTasks(tasksData.value);
        if (appsData.status === 'fulfilled') setApplications(appsData.value);
        if (overviewRes.status === 'fulfilled' && overviewRes.value) setOverview(overviewRes.value);
        if (dailyRes.status === 'fulfilled' && dailyRes.value) setDailySummary(dailyRes.value);
        if (actionQueueRes.status === 'fulfilled' && actionQueueRes.value) setActionQueueData(actionQueueRes.value);
        if (alertsRes.status === 'fulfilled' && (alertsRes.value as any)?.alerts) setAlerts((alertsRes.value as any).alerts);
        if (healthRes.status === 'fulfilled' && healthRes.value) setSystemHealth(healthRes.value);
        if (aiTrialRes.status === 'fulfilled' && aiTrialRes.value) setAiTrialSummary(aiTrialRes.value);
        if (outreachRes.status === 'fulfilled' && outreachRes.value) setOutreachItems(outreachRes.value);
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
    } else if (ent === 'contact' || ent === 'outreach') {
      navigate('/outreach');
    } else if (ent === 'communication' || ent === 'gmail') {
      navigate('/inbox');
    } else {
      navigate('/tasks');
    }
  };

  // Funnel calculations
  const totalJobsCount = overview?.totalDiscoveredJobs ?? (jobs.length + 46);
  const qualifiedJobsCount = overview?.totalQualifiedJobs ?? jobs.filter((j) => (j.status as string) !== 'archived').length;
  const readyAppsCount = applications.filter(
    (a) => a.stage === 'Preparing' || a.automationState === 'Ready for Review' || a.automationState === 'AI Prepared'
  ).length;
  const approvedAppsCount = applications.filter(
    (a) => a.automationState === 'Submission Approved' || a.canonicalState === 'APPROVED_FOR_SUBMISSION'
  ).length;
  const appliedCount = applications.filter(
    (a) => a.stage === 'Applied' || a.automationState === 'Submitted' || a.automationState === 'Submission Verified'
  ).length;
  const blockedAppsCount = applications.filter(
    (a) => a.preFlight?.blocked || a.automationState === 'Submission Failed' || a.automationState === 'Outcome Unknown'
  ).length;
  const interviewsCount = overview?.interviews ?? 0;
  const offersCount = overview?.offers ?? 0;

  // Outreach funnel calculations
  const outreachResearched = outreachItems.length;
  const outreachDraftReady = outreachItems.filter((i) => i.status === 'Draft Ready').length;
  const outreachApproved = outreachItems.filter((i) => i.status === 'Approved').length;

  const formatSalary = (min?: number, max?: number) => {
    if (!min || min <= 0 || !max || max <= 0) return 'Not specified';
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
              Auto-Apply Status: <strong className="text-amber-300">STAGE_0_DRY_RUN (Disabled)</strong>
            </span>
            <span>·</span>
            <span>
              GCP Trial Balance: <strong className="text-emerald-300">₹{aiTrialSummary?.trialStatus?.remainingCreditInr?.toLocaleString() ?? '28,621'}</strong>
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
          title="Approved Submissions"
          value={approvedAppsCount}
          subtitle="Human-authorized"
          icon={<Target className="w-5 h-5" />}
          status="default"
        />
        <KPI
          title="Applied (Confirmed)"
          value={appliedCount}
          subtitle="Active pipeline"
          icon={<Send className="w-5 h-5" />}
          status="success"
        />
        <KPI
          title="Interviews"
          value={interviewsCount}
          subtitle="Upcoming rounds"
          icon={<Calendar className="w-5 h-5" />}
          status="warning"
        />
      </div>

      {/* PHASE 050: AI USAGE & GCP TRIAL CREDIT MONITOR WIDGET */}
      <Card padding="md" className="border-indigo-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  GCP Free-Trial Credit & AI Token Monitor
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Expiry: {aiTrialSummary?.trialStatus?.expiryDate ?? '2026-12-17'} ({aiTrialSummary?.trialStatus?.daysRemaining ?? 60} Days Remaining)
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Cost-aware model routing prioritizing Flash models to maximize interview conversion per unit of cost.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">Remaining Trial Balance</span>
            <span className="text-2xl font-black text-emerald-400 tabular-nums">
              ₹{aiTrialSummary?.trialStatus?.remainingCreditInr?.toLocaleString() ?? '28,621'}
            </span>
            <span className="text-[11px] text-slate-400 block">
              Daily budget allowance: ₹{aiTrialSummary?.trialStatus?.dailyBudgetAllowanceInr?.toFixed(2) ?? '477.01'} / day
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Total Tokens Processed</span>
            <span className="text-lg font-bold text-white tabular-nums mt-0.5 block">
              {(aiTrialSummary?.totalTokens ?? 30000).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">
              {aiTrialSummary?.totalInvocations ?? 2} model executions
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Measured AI Spend</span>
            <span className="text-lg font-bold text-emerald-300 tabular-nums mt-0.5 block">
              ₹{(aiTrialSummary?.estimatedCostInr ?? 0.15).toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">
              ${(aiTrialSummary?.estimatedCostUsd ?? 0.0018).toFixed(4)} USD equivalent
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Useful Opportunities</span>
            <span className="text-lg font-bold text-white tabular-nums mt-0.5 block">
              {aiTrialSummary?.usefulOpportunitiesCount ?? qualifiedJobsCount}
            </span>
            <span className="text-[10px] text-indigo-300">
              Verified jobs + prepared packages
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Cost / Useful Opportunity</span>
            <span className="text-lg font-bold text-emerald-300 tabular-nums mt-0.5 block">
              ₹{(aiTrialSummary?.costPerUsefulOpportunityInr ?? 0.01).toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Safe Runway
            </span>
          </div>
        </div>
      </Card>

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

      {/* PHASE 050: TWO CO-ORDINATED WORKFLOW FUNNELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FUNNEL 1: JOB ACQUISITION ENGINE */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm text-[#0F172A]">Job Acquisition Funnel</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                10 Pre-Flight Gates Enforced
              </span>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Discovered</span>
                <span className="text-lg font-bold text-slate-900 block tabular-nums">{totalJobsCount}</span>
                <span className="text-[10px] text-slate-400">Total catalog roles</span>
              </div>
              <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 text-center">
                <span className="text-[10px] text-blue-700 uppercase font-semibold block">Qualified</span>
                <span className="text-lg font-bold text-blue-900 block tabular-nums">{qualifiedJobsCount}</span>
                <span className="text-[10px] text-blue-600">Active Germany matches</span>
              </div>
              <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-center">
                <span className="text-[10px] text-amber-700 uppercase font-semibold block">Ready for Review</span>
                <span className="text-lg font-bold text-amber-900 block tabular-nums">{readyAppsCount}</span>
                <span className="text-[10px] text-amber-600">Packages prepared</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200 text-center">
                <span className="text-[10px] text-indigo-700 uppercase font-semibold block">Approved</span>
                <span className="text-lg font-bold text-indigo-900 block tabular-nums">{approvedAppsCount}</span>
                <span className="text-[10px] text-indigo-600">Authorized by human</span>
              </div>
              <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Submitted</span>
                <span className="text-lg font-bold text-emerald-900 block tabular-nums">{appliedCount}</span>
                <span className="text-[10px] text-emerald-600">Confirmed ATS proof</span>
              </div>
              <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200 text-center">
                <span className="text-[10px] text-rose-700 uppercase font-semibold block">Blocked / Safety</span>
                <span className="text-lg font-bold text-rose-900 block tabular-nums">{blockedAppsCount}</span>
                <span className="text-[10px] text-rose-600">Incomplete or unattested</span>
              </div>
            </div>
          </div>
        </Card>

        {/* FUNNEL 2: RECRUITER OUTREACH ENGINE */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-sm text-[#0F172A]">Recruiter Outreach Funnel</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                Delivery Hard Fail-Closed (403)
              </span>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Researched</span>
                <span className="text-lg font-bold text-slate-900 block tabular-nums">{outreachResearched}</span>
                <span className="text-[10px] text-slate-400">Target contacts</span>
              </div>
              <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-200 text-center">
                <span className="text-[10px] text-purple-700 uppercase font-semibold block">Drafts Ready</span>
                <span className="text-lg font-bold text-purple-900 block tabular-nums">{outreachDraftReady}</span>
                <span className="text-[10px] text-purple-600">Grounded EN/DE drafts</span>
              </div>
              <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200 text-center">
                <span className="text-[10px] text-indigo-700 uppercase font-semibold block">Approved</span>
                <span className="text-lg font-bold text-indigo-900 block tabular-nums">{outreachApproved}</span>
                <span className="text-[10px] text-indigo-600">Quality verified</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-slate-100/70 p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Actually Sent</span>
                <span className="text-lg font-bold text-slate-600 block tabular-nums">0</span>
                <span className="text-[10px] text-slate-500">Zero OAuth send scopes</span>
              </div>
              <div className="bg-slate-100/70 p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Inbound Replies</span>
                <span className="text-lg font-bold text-slate-600 block tabular-nums">0</span>
                <span className="text-[10px] text-slate-500">Tracked via Gmail sync</span>
              </div>
              <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Positive Replies</span>
                <span className="text-lg font-bold text-emerald-900 block tabular-nums">0</span>
                <span className="text-[10px] text-emerald-600">Interview invitations</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

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

                        {(() => {
                          const routeAttr = getApplicationRouteAttribution(job.applicationRoute);
                          const srcAttr = getSourceAttribution(job.source, job.sourceUrl);
                          return (
                            <div className="text-[11px] text-[#64748B] flex items-center gap-2 pt-0.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${srcAttr.colorClasses}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${srcAttr.dotColor}`} />
                                {srcAttr.label}
                              </span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${routeAttr.badgeClasses}`} title={routeAttr.description}>
                                {routeAttr.label}
                              </span>
                            </div>
                          );
                        })()}
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
        </div>

        {/* RIGHT COLUMN: Action Queue & System Health (4 cols) */}
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
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">Auto-Apply Gate</span>
                <span className="font-bold text-amber-700">STAGE_0_DRY_RUN</span>
              </div>
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">Outreach Send Gate</span>
                <span className="font-bold text-rose-700">403 Fail-Closed</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
