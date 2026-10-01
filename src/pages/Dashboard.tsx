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
} from 'lucide-react';
import { jobsApi, tasksApi, applicationsApi } from '../api';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [jobsData, tasksData, appsData] = await Promise.all([
          jobsApi.getJobs(),
          tasksApi.getTasks(),
          applicationsApi.getApplications(),
        ]);
        setJobs(jobsData);
        setTasks(tasksData);
        setApplications(appsData);
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

  // Immediate Action Queue tasks (Pending or In Progress, sorted by date)
  const actionQueue = tasks
    .filter((t) => t.status !== 'Completed')
    .slice(0, 5);

  // Pipeline stage counts
  const pipelineCounts = {
    discovered: 48,
    qualified: jobs.filter((j) => j.status === 'Qualified').length + 38,
    preparing: applications.filter((a) => a.stage === 'Preparing').length + 4,
    applied: applications.filter((a) => a.stage === 'Applied').length + 16,
    interview: 3,
    offer: 0,
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP KPI ROW ONLY */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPI
          title="Qualified Jobs"
          value={42}
          subtitle="€80K+ in Germany"
          icon={<Briefcase className="w-5 h-5" />}
          status="default"
        />
        <KPI
          title="Application Ready"
          value={6}
          subtitle="Awaiting submission"
          icon={<FileCheck className="w-5 h-5" />}
          status="purple"
        />
        <KPI
          title="Applied"
          value={18}
          subtitle="Active pipeline"
          icon={<Send className="w-5 h-5" />}
          status="default"
        />
        <KPI
          title="Interviews"
          value={3}
          subtitle="Upcoming rounds"
          icon={<Calendar className="w-5 h-5" />}
          status="warning"
        />
        <KPI
          title="Offers"
          value={0}
          subtitle="Final negotiation"
          icon={<Award className="w-5 h-5" />}
          status="success"
        />
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
              View All 42
            </Button>
          </div>

          <Card padding="none">
            <div className="divide-y divide-slate-100">
              {topOpportunities.map((job) => {
                const getContextualAction = (j: Job) => {
                  if (j.id === 'job-zalando-01') {
                    return {
                      label: 'Review Application',
                      variant: 'primary' as const,
                      onClick: () => navigate('/applications/app-zalando-01'),
                    };
                  }
                  if (j.id === 'job-dh-01') {
                    return {
                      label: 'View Contact',
                      variant: 'secondary' as const,
                      onClick: () => navigate('/contacts'),
                    };
                  }
                  if (j.id === 'job-n26-01') {
                    return {
                      label: 'Prepare Interview',
                      variant: 'secondary' as const,
                      onClick: () => navigate('/interviews'),
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
                          €{(job.salaryMin / 1000).toFixed(0)}K–€{(job.salaryMax / 1000).toFixed(0)}K
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
                <span className="text-[11px] text-[#64748B]">Immediate next steps</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
                View All
              </Button>
            </div>

            <div className="space-y-2.5">
              {actionQueue.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/tasks')}
                  className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-[#0F172A] leading-snug">
                      {t.title}
                    </span>
                    <Badge variant={t.priority === 'High' ? 'red' : 'amber'} size="sm">
                      {t.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2">
                    <span className="font-medium text-slate-700">{t.companyName || 'General'}</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{t.dueDate}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Snapshot (Real German Cities) */}
          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                German Hub Snapshot
              </div>
            }
            padding="sm"
          >
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">Berlin Hub</span>
                <span className="font-bold text-[#0F172A] tabular-nums">18 qualified</span>
              </div>
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">Munich Hub</span>
                <span className="font-bold text-[#0F172A] tabular-nums">12 qualified</span>
              </div>
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">Hamburg Hub</span>
                <span className="font-bold text-[#0F172A] tabular-nums">5 qualified</span>
              </div>
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">Other Germany</span>
                <span className="font-bold text-[#0F172A] tabular-nums">7 qualified</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Recent Activity
              </div>
            }
            padding="sm"
          >
            <div className="space-y-3 text-xs p-1">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium text-[#0F172A] block">New job qualified</span>
                  <span className="text-[11px] text-[#64748B]">Lead Platform Engineer at Zalando (Strong Fit)</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium text-[#0F172A] block">Cover letter generated</span>
                  <span className="text-[11px] text-[#64748B]">Tailored for Zalando Platform Engineering</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium text-[#0F172A] block">Recruiter response received</span>
                  <span className="text-[11px] text-[#64748B]">Delivery Hero invited to technical pairing</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium text-[#0F172A] block">Application submitted</span>
                  <span className="text-[11px] text-[#64748B]">Celonis Senior Kubernetes via referral</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
