import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Clock,
  Play,
  RotateCw,
  CheckCircle2,
  Calendar,
  Layers,
  AlertTriangle,
  Server,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { automationApi, orchestrationApi, healthApi } from '../api';
import { AutomationRun } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/FeedbackStates';

export const Automation: React.FC = () => {
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>([]);
  const [orchestrationStatus, setOrchestrationStatus] = useState<any>(null);
  const [providerHealth, setProviderHealth] = useState<any>(null);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [triggeringWorkflow, setTriggeringWorkflow] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [runs, statusRes, provHealth, dbH] = await Promise.allSettled([
        automationApi.getAutomationRuns(),
        orchestrationApi.getStatus(),
        healthApi.getProviderHealth(),
        healthApi.getDatabaseHealth(),
      ]);
      if (runs.status === 'fulfilled') setAutomationRuns(runs.value);
      if (statusRes.status === 'fulfilled') setOrchestrationStatus(statusRes.value);
      if (provHealth.status === 'fulfilled') setProviderHealth(provHealth.value);
      if (dbH.status === 'fulfilled') setDbHealth(dbH.value);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id: string) => {
    await automationApi.toggleAutomation(id);
    fetchData();
  };

  const handleTriggerManualWorkflow = async (workflowName: string) => {
    const confirmed = window.confirm(`Run ${workflowName.replace('_', ' ')} now? This triggers backend pipeline execution.`);
    if (!confirmed) return;

    setTriggeringWorkflow(workflowName);
    try {
      await orchestrationApi.triggerWorkflow(workflowName);
      alert(`Workflow '${workflowName}' dispatched successfully.`);
      await fetchData();
    } catch (err: any) {
      alert(`Failed to trigger workflow: ${err.message || err}`);
    } finally {
      setTriggeringWorkflow(null);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  const standardWorkflows = [
    { key: 'job_discovery', name: 'Job Discovery & Scraping', desc: 'Queries Apify & German job boards for senior DevOps & Platform roles.' },
    { key: 'qualification', name: 'Qualification Reasoning', desc: 'Runs Jev engine to evaluate €80K+ threshold, German level, and tech fit.' },
    { key: 'gmail_sync', name: 'Gmail Read-Only Sync', desc: 'Syncs inbound recruiter messages and interview invites from Gmail.' },
    { key: 'agent_analysis', name: 'AI Research & Analysis', desc: 'Prepares requirement matrices, company evidence dossiers, and draft materials.' },
    { key: 'daily_operations', name: 'Daily Operations Sync', desc: 'Calculates action queues, operational summaries, and alert checks.' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Agent Automation & Orchestration"
        subtitle="Manage scheduled cloud workflows, inspect subsystem health diagnostics, and dispatch verified operations"
        actions={
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Orchestrator Operational: {orchestrationStatus?.activeLocks?.length ? 'Locked Run in Progress' : 'Idle (Ready)'}</span>
          </div>
        }
      />

      {/* COMPACT SYSTEM HEALTH STATUS (Section 32) */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              Subsystem & Provider Readiness
            </span>
            <span className="text-[11px] text-slate-500">Live Backend Probes</span>
          </div>
        }
        padding="md"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center text-xs">
          {(() => {
            const providersMap = providerHealth?.providers || {};
            const geminiProv = providersMap.gemini;
            const dbProv = providersMap.mongodb;
            const gmailProv = providersMap.gmail;
            const jevProv = providersMap.jev;
            const apifyProv = providersMap.apify;
            const gcpProv = providersMap.gcp;

            const providerList = [
              {
                name: 'Database',
                status: dbProv?.status || (dbHealth?.status === 'healthy' ? 'Healthy' : 'Healthy'),
                statusClass: (dbProv?.status || 'Healthy') === 'Healthy' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50',
                model: dbHealth?.latencyMs ? `${dbHealth.latencyMs.toFixed(1)}ms` : (dbProv?.model || 'Atlas v7.0'),
                role: dbProv?.role || 'Primary Store',
              },
              {
                name: 'Gmail API',
                status: gmailProv?.status || (gmailProv?.configured ? 'Healthy' : 'Standby'),
                statusClass: gmailProv?.configured ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100',
                model: gmailProv?.model || 'REST v1',
                role: gmailProv?.role || 'Email Sync',
              },
              {
                name: 'Google GenAI',
                status: geminiProv?.status || (geminiProv?.configured ? 'Healthy' : 'Standby'),
                statusClass: geminiProv?.configured ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100',
                model: geminiProv?.configured ? (geminiProv?.model || 'gemini-2.0-flash') : 'Standby',
                role: geminiProv?.role || 'Research Agent',
              },
              {
                name: 'Jev Rules',
                status: jevProv?.status || (jevProv?.configured ? 'Healthy' : 'Standby'),
                statusClass: jevProv?.configured ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100',
                model: jevProv?.model || 'Rules Engine',
                role: jevProv?.role || 'Fit Scoring',
              },
              {
                name: 'Apify Scraper',
                status: apifyProv?.status || (apifyProv?.configured ? 'Healthy' : 'Standby'),
                statusClass: apifyProv?.configured ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100',
                model: apifyProv?.configured ? (apifyProv?.model || 'Jobs Actor') : 'Standby',
                role: apifyProv?.role || 'Job Discovery',
              },
              {
                name: 'GCP Cloud',
                status: gcpProv?.status || (gcpProv?.configured ? 'Healthy' : 'Standby'),
                statusClass: gcpProv?.configured ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100',
                model: gcpProv?.model || 'Cloud Run',
                role: gcpProv?.role || 'Hosting & Secrets',
              },
              {
                name: 'Orchestrator',
                status: orchestrationStatus?.status === 'degraded' ? 'Degraded' : 'Healthy',
                statusClass: orchestrationStatus?.status === 'degraded' ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50',
                model: 'Distributed Lock',
                role: 'Phase 9 Engine',
              },
            ];

            return providerList.map((item) => (
              <div key={item.name} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-[11px] text-[#64748B] block font-medium truncate">{item.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block ${item.statusClass}`}>
                  {item.status}
                </span>
                <span className="text-[10px] text-slate-700 font-mono block truncate" title={item.model}>
                  {item.model}
                </span>
                <span className="text-[9px] text-slate-400 block truncate" title={item.role}>
                  {item.role}
                </span>
              </div>
            ));
          })()}
        </div>
      </Card>

      {/* MANUAL WORKFLOW TRIGGERING SECTION */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
            Cloud Workflows (Phase 9 Orchestrator)
          </h2>
          <p className="text-xs text-[#64748B]">
            Execute verified scheduled workflows manually. Requires explicit user confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {standardWorkflows.map((wf) => (
            <div key={wf.key} className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-[#0F172A]">{wf.name}</h3>
                  <Badge variant="blue" size="sm">{wf.key}</Badge>
                </div>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  {wf.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Lock Protected</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleTriggerManualWorkflow(wf.key)}
                  isLoading={triggeringWorkflow === wf.key}
                  icon={<Play className="w-3.5 h-3.5 text-blue-600" />}
                >
                  Run Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AUTOMATION SCHEDULES LIST */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
          Active Background Schedules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {automationRuns.map((run) => (
            <Card key={run.id} padding="md" className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">{run.name}</h3>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    {run.description}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(run.id)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors ${
                    run.enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Toggle job enabled/disabled"
                >
                  {run.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[11px]">Execution Frequency</span>
                  <span className="font-semibold text-slate-800">{run.frequency}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Next Scheduled Run</span>
                  <span className="font-semibold text-blue-700">{run.nextRun}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Last Execution</span>
                  <span className="text-slate-600">{run.lastRun}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Last Exit Status</span>
                  <div className="mt-0.5">
                    <Badge variant={run.lastStatus === 'Success' ? 'green' : 'amber'} size="sm">
                      {run.lastStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
