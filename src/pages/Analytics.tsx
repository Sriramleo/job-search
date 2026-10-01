import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Euro,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { analyticsApi } from '../api';
import { AIUsage } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/FeedbackStates';

export const Analytics: React.FC = () => {
  const [aiUsage, setAiUsage] = useState<AIUsage[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usage, data] = await Promise.all([
          analyticsApi.getAIUsage(),
          analyticsApi.getAnalyticsData(),
        ]);
        setAiUsage(usage);
        setAnalyticsData(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !analyticsData) {
    return <LoadingSkeleton lines={8} />;
  }

  const totalAICost = aiUsage.reduce((acc, curr) => acc + curr.costEstimateEur, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Recruitment Analytics & Telemetry"
        subtitle="Performance metrics across candidate funnel stages, referral yield, compensation distributions, and AI provider costs"
      />

      {/* Funnel Progression Bar */}
      <Card
        header={
          <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
            Conversion Funnel Analysis
          </div>
        }
        padding="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center text-xs">
            {analyticsData.applicationFunnel.map((item: any) => (
              <div key={item.stage} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-[11px] text-[#64748B] block truncate">{item.stage}</span>
                <span className="text-xl font-bold text-[#0F172A] tabular-nums block">{item.count}</span>
                <span className="text-[10px] font-semibold text-blue-600 block">{item.percentage}%</span>
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
              {analyticsData.sourceAnalysis.map((s: any) => (
                <tr key={s.source}>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{s.source}</td>
                  <td className="py-2.5 px-3 text-center tabular-nums">{s.count}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{s.qualifiedRate}</td>
                </tr>
              ))}
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
            {analyticsData.salaryDistribution.map((band: any) => {
              const pct = (band.count / 42) * 100;
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
            })}
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
              Total MTD: €{totalAICost.toFixed(2)}
            </span>
          </div>
        }
        padding="none"
      >
        <div className="divide-y divide-slate-100 text-xs">
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
    </div>
  );
};
