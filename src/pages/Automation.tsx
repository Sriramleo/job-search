import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Clock,
  Play,
  Pause,
  RotateCw,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { automationApi } from '../api';
import { AutomationRun } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/FeedbackStates';

export const Automation: React.FC = () => {
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRuns = async () => {
    try {
      const data = await automationApi.getAutomationRuns();
      setAutomationRuns(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleToggle = async (id: string) => {
    await automationApi.toggleAutomation(id);
    fetchRuns();
  };

  if (isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Automation Schedules"
        subtitle="Operational schedules for automated job scraping, qualification reasoning, company research, and communication monitoring"
        actions={
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Agent Engine Standing By (Phase 1 UI)</span>
          </div>
        }
      />

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

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-[#64748B]">
                Task Runner: Autonomous Background Worker
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => alert(`Simulated manual trigger for: ${run.name}`)}
                icon={<RotateCw className="w-3 h-3" />}
              >
                Run Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
