import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Euro,
  Layers,
  Sparkles,
  PieChart,
  Calendar,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { analyticsApi } from '../api';
import { AIUsage } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/FeedbackStates';

export const Analytics: React.FC = () => {
  const [windowFilter, setWindowFilter] = useState<'today' | '7d' | '30d' | '90d'>('30d');
  const [aiUsage, setAiUsage] = useState<AIUsage[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [jobFunnel, setJobFunnel] = useState<any>(null);
  const [aiCostData, setAiCostData] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usage, data, funnel, aiCost, anomaliesRes] = await Promise.allSettled([
          analyticsApi.getAIUsage(),
          analyticsApi.getAnalyticsData(),
          analyticsApi.getJobFunnel({ window: windowFilter }),
          analyticsApi.getAICost(),
          analyticsApi.getAIAnomalies(),
        ]);

        if (usage.status === 'fulfilled') setAiUsage(usage.value);
        if (data.status === 'fulfilled') setAnalyticsData(data.value);
        if (funnel.status === 'fulfilled') setJobFunnel(funnel.value);
        if (aiCost.status === 'fulfilled') setAiCostData(aiCost.value);
        if (anomaliesRes.status === 'fulfilled' && (anomaliesRes.value as any)?.anomalies) {
          setAnomalies((anomaliesRes.value as any).anomalies);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [windowFilter]);

  if (isLoading && !analyticsData && !jobFunnel) {
    return <LoadingSkeleton lines={8} />;
  }

  const totalAICost = aiCostData?.totalEstimatedCostEur ?? aiUsage.reduce((acc, curr) => acc + curr.costEstimateEur, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Recruitment Analytics & Telemetry"
          subtitle="Performance metrics across candidate funnel stages, conversion rates, and AI provider consumption"
        />

        {/* Time Window Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
          {(['today', '7d', '30d', '90d'] as const).map((win) => (
            <button
              key={win}
              onClick={() => setWindowFilter(win)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                windowFilter === win
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {win === 'today' ? 'Today' : win.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Funnel Progression Bar */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
              Conversion Funnel Analysis ({windowFilter.toUpperCase()})
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Overall Rate: {jobFunnel?.overallConversionRate != null ? `${(jobFunnel.overallConversionRate * 100).toFixed(1)}%` : 'N/A'}
            </span>
          </div>
        }
        padding="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center text-xs">
            {(jobFunnel?.stages || analyticsData?.applicationFunnel || []).map((item: any) => (
              <div key={item.stage} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-[11px] text-[#64748B] block truncate">{item.stage}</span>
                <span className="text-xl font-bold text-[#0F172A] tabular-nums block">{item.count}</span>
                <span className="text-[10px] font-semibold text-blue-600 block">
                  {item.conversionRate != null
                    ? `${(item.conversionRate * 100).toFixed(1)}%`
                    : item.percentage != null
                    ? `${item.percentage}%`
                    : 'N/A'}
                </span>
              </div>
            ))}
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div style={{ width: '40%' }} className="bg-blue-600" title="Discovered & Qualified" />
            <div style={{ width: '30%' }} className="bg-amber-500" title="Applied" />
            <div style={{ width: '20%' }} className="bg-emerald-500" title="Interviews" />
            <div style={{ width: '10%' }} className="bg-purple-600" title="Offers" />
          </div>
        </div>
      </Card>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Analysis */}
        <Card
          header={
            <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
              Source & Referral Yield
            </div>
          }
          padding="sm"
        >
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[#64748B] font-semibold">
                <th className="py-2.5 px-3">Lead Channel</th>
                <th className="py-2.5 px-3 text-center">Volume</th>
                <th className="py-2.5 px-3 text-right">Qualified Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!analyticsData?.sourceAnalysis || analyticsData.sourceAnalysis.length === 0) ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-slate-500">
                    No data available
                  </td>
                </tr>
              ) : (
                analyticsData.sourceAnalysis.map((s: any) => (
                  <tr key={s.source}>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{s.source}</td>
                    <td className="py-2.5 px-3 text-center tabular-nums">{s.count}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{s.qualifiedRate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* Salary Distribution */}
        <Card
          header={
            <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
              Target Salary Distribution (€80K+ Baseline)
            </div>
          }
          padding="sm"
        >
          <div className="space-y-3 p-3 text-xs">
            {(!analyticsData?.salaryDistribution || analyticsData.salaryDistribution.length === 0) ? (
              <div className="py-4 text-center text-slate-500">No data available</div>
            ) : (
              analyticsData.salaryDistribution.map((band: any) => {
                const total = analyticsData?.totalJobs || 21;
                const pct = total > 0 ? (band.count / total) * 100 : 0;
                return (
                  <div key={band.band} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800">{band.band}</span>
                      <span className="text-slate-500 tabular-nums">{band.count} roles ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full bg-blue-600 rounded-full" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* AI Telemetry & Usage Costs */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              AI & Crawling Consumption Telemetry
            </span>
            <span className="text-xs font-bold text-purple-700 tabular-nums">
              Total MTD: €{typeof totalAICost === 'number' ? totalAICost.toFixed(2) : '0.00'}
            </span>
          </div>
        }
        padding="none"
      >
        <div className="divide-y divide-slate-100 text-xs">
          {aiCostData ? (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-purple-50/20">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Total Tokens</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {(aiCostData.totalTokens || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Input / Output</span>
                <span className="text-xs font-medium text-slate-700 tabular-nums">
                  {(aiCostData.inputTokens || 0).toLocaleString()} / {(aiCostData.outputTokens || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Executions</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {aiCostData.totalExecutions || aiCostData.executions || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">GCP Billing State</span>
                <span className="text-xs font-semibold text-slate-700">
                  {aiCostData.gcpBilling === 'unavailable' ? 'GCP billing unavailable' : 'Active'}
                </span>
              </div>
            </div>
          ) : null}

          {aiUsage.map((ai) => (
            <div key={ai.provider} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#0F172A]">{ai.provider} Engine</span>
                  <Badge variant="purple" size="sm">
                    {ai.requestsThisMonth} calls
                  </Badge>
                </div>
                <span className="text-[11px] text-[#64748B] block mt-0.5">{ai.modelOrTask}</span>
              </div>

              <div className="flex items-center gap-6 sm:text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Volume</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {ai.tokensOrUnits.toLocaleString()} units
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Est. Cost</span>
                  <span className="font-bold text-purple-800 tabular-nums">
                    €{ai.costEstimateEur.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Anomalies Card if any */}
      {anomalies.length > 0 && (
        <Card
          header={
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              AI & Operational Anomalies Detected ({anomalies.length})
            </div>
          }
          padding="sm"
        >
          <div className="space-y-2 text-xs p-1">
            {anomalies.map((a, i) => (
              <div key={i} className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start justify-between">
                <span>{a.description}</span>
                <span className="font-mono text-[10px] text-amber-700">{a.severity}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
