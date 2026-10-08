import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sliders,
  Activity,
  History,
  FileCheck,
  Building,
  FileText,
  Lock,
} from 'lucide-react';
import { campaignApi } from '../../api';
import {
  CampaignConfig,
  CampaignCycleExecutionResult,
  CampaignDailyStatus,
  CampaignQueueEvaluationResult,
  CampaignRun,
  DailyCampaignReport,
} from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSkeleton, EmptyState } from '../ui/FeedbackStates';

export const CampaignDashboard: React.FC = () => {
  const [status, setStatus] = useState<CampaignDailyStatus | null>(null);
  const [config, setConfig] = useState<CampaignConfig | null>(null);
  const [evaluation, setEvaluation] = useState<CampaignQueueEvaluationResult | null>(null);
  const [runs, setRuns] = useState<CampaignRun[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyCampaignReport | null>(null);
  const [cycleResult, setCycleResult] = useState<CampaignCycleExecutionResult | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showArmModal, setShowArmModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Edit config state
  const [editLimit, setEditLimit] = useState(1);
  const [editFit, setEditFit] = useState(85);
  const [editReady, setEditReady] = useState(90);
  const [editCompanyLimit, setEditCompanyLimit] = useState(1);
  const [editAtsLimit, setEditAtsLimit] = useState(1);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, runsRes, reportRes] = await Promise.allSettled([
        campaignApi.getStatus(),
        campaignApi.getRuns(10),
        campaignApi.getDailyReport(),
      ]);
      if (statusRes.status === 'fulfilled') {
        setStatus(statusRes.value);
        setConfig(statusRes.value.config);
        setEditLimit(statusRes.value.config.dailyMaxApplications);
        setEditFit(statusRes.value.config.minFitScore);
        setEditReady(statusRes.value.config.minReadinessScore);
        setEditCompanyLimit(statusRes.value.config.maxPerCompanyDaily);
        setEditAtsLimit(statusRes.value.config.maxPerAtsDaily);
      }
      if (runsRes.status === 'fulfilled') {
        setRuns(runsRes.value);
      }
      if (reportRes.status === 'fulfilled') {
        setDailyReport(reportRes.value);
      }
    } catch (err) {
      console.error('Failed to load campaign data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunDryRun = async () => {
    setIsRunningCycle(true);
    try {
      const res = await campaignApi.runCycle(true);
      setCycleResult(res);
      await loadData();
    } catch (err) {
      console.error('Failed to run dry-run cycle:', err);
    } finally {
      setIsRunningCycle(false);
    }
  };

  const handleArmStage1 = async () => {
    setIsUpdating(true);
    try {
      const res = await campaignApi.armStage1();
      setConfig(res);
      setShowArmModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to arm Stage 1 campaign:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePauseCampaign = async () => {
    setIsUpdating(true);
    try {
      const res = await campaignApi.setStage0DryRun();
      setConfig(res);
      await loadData();
    } catch (err) {
      console.error('Failed to pause campaign:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmergencyStop = async () => {
    setIsUpdating(true);
    try {
      const updated = await campaignApi.emergencyStop();
      setConfig(updated);
      await loadData();
    } catch (err) {
      console.error('Failed to trigger emergency stop:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEvaluateQueue = async () => {
    setIsEvaluating(true);
    try {
      const evalRes = await campaignApi.evaluateQueue();
      setEvaluation(evalRes);
    } catch (err) {
      console.error('Failed to evaluate queue:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsUpdating(true);
    try {
      const updated = await campaignApi.updateConfig({
        ...config,
        dailyMaxApplications: Number(editLimit),
        minFitScore: Number(editFit),
        minReadinessScore: Number(editReady),
        maxPerCompanyDaily: Number(editCompanyLimit),
        maxPerAtsDaily: Number(editAtsLimit),
      });
      setConfig(updated);
      setShowConfigModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  const isEmergencyStop = config?.emergencyStop;
  const isArmed = config?.isEnabled && !isEmergencyStop && config?.stage === 'STAGE_1_SINGLE_DAILY';
  const currentStage = config?.stage || 'STAGE_0_DRY_RUN';

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      {isEmergencyStop ? (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between text-rose-900 shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-sm block">EMERGENCY STOP ENGAGED</span>
              <span className="text-xs text-rose-700">
                All autonomous candidate applications are locked and blocked. Human operator intervention required.
              </span>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePauseCampaign}
            disabled={isUpdating}
          >
            Reset Stop to Stage 0
          </Button>
        </div>
      ) : isArmed ? (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-900 shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">STAGE 1: 1-PER-DAY CAMPAIGN ARMED</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-200 text-emerald-800">
                  {currentStage}
                </span>
              </div>
              <span className="text-xs text-emerald-700">
                Strict single daily application limit. Remaining quota: {status?.remainingCapacity ?? 0}.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRunDryRun}
              disabled={isRunningCycle || isUpdating}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isRunningCycle ? 'animate-spin' : ''}`} />}
            >
              Run Dry Run
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePauseCampaign}
              disabled={isUpdating}
              icon={<Pause className="w-3.5 h-3.5" />}
            >
              Pause Campaign
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleEmergencyStop}
              disabled={isUpdating}
              icon={<ShieldAlert className="w-3.5 h-3.5" />}
            >
              Emergency Stop
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[#0F172A] shadow-xs">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-slate-500 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm block">CAMPAIGN STANDBY (DISABLED) — STAGE 0 DRY-RUN</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-800">
                  {currentStage}
                </span>
              </div>
              <span className="text-xs text-[#64748B]">
                Autonomous applications disabled. Queue evaluation and dry-runs only (zero real submissions).
              </span>
            </div>

          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRunDryRun}
              disabled={isRunningCycle || isUpdating}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isRunningCycle ? 'animate-spin' : ''}`} />}
            >
              {isRunningCycle ? 'Executing Dry Run...' : 'Run Dry Run'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowArmModal(true)}
              disabled={isUpdating}
              icon={<Play className="w-3.5 h-3.5" />}
            >
              Arm 1-per-day Campaign
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEmergencyStop}
              disabled={isUpdating}
              icon={<ShieldAlert className="w-3.5 h-3.5 text-rose-600" />}
            >
              Emergency Stop
            </Button>
          </div>
        </div>
      )}

      {/* Cycle Execution Banner if recently run */}
      {cycleResult && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-blue-900 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[11px] block">
                Cycle Result: {cycleResult.status} ({cycleResult.dryRun ? 'Dry Run' : 'Active'})
              </span>
              <span>{cycleResult.message}</span>
            </div>
          </div>
          <span className="text-[10px] text-blue-600 font-mono">
            Run: {cycleResult.runId}
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Today's Cap</span>
          <span className="text-xl font-bold text-[#0F172A] mt-1 block">
            {config?.dailyMaxApplications ?? 1}
          </span>
          <span className="text-[10px] text-slate-400">Max applications/day</span>
        </Card>

        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Submitted Today</span>
          <span className="text-xl font-bold text-blue-600 mt-1 block">
            {status?.submittedToday ?? 0}
          </span>
          <span className="text-[10px] text-slate-400">
            {(status?.existingConfirmedToday ?? 0) > 0
              ? `${status?.existingConfirmedToday} existing, ${status?.campaignSubmissionsConfirmed ?? 0} campaign`
              : 'Confirmed applications'}
          </span>
        </Card>

        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Remaining Quota</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">
            {status?.remainingCapacity ?? 0}
          </span>
          <span className="text-[10px] text-slate-400">Available slots</span>
        </Card>

        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Locked Slots</span>
          <span className="text-xl font-bold text-amber-600 mt-1 block">
            {status?.lockedSlots ?? 0}
          </span>
          <span className="text-[10px] text-slate-400">Unknown/unverified slots</span>
        </Card>

        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Min Fit Score</span>
          <span className="text-xl font-bold text-[#0F172A] mt-1 block">
            {config?.minFitScore ?? 85}%
          </span>
          <span className="text-[10px] text-slate-400">Qualification floor</span>
        </Card>

        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Min Readiness</span>
          <span className="text-xl font-bold text-[#0F172A] mt-1 block">
            {config?.minReadinessScore ?? 90}%
          </span>
          <span className="text-[10px] text-slate-400">Profile completeness</span>
        </Card>
      </div>

      {/* Section 10 Daily Campaign Report Summary */}
      {dailyReport && (
        <Card className="p-5 border border-[#E2E8F0] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-[#0F172A]">Daily Campaign Report ({dailyReport.date})</h3>
              </div>
              <p className="text-xs text-[#64748B]">
                Production summary of candidate discovery, safety gating, and daily quota accounting.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={loadData}
                icon={<RefreshCw className="w-3 h-3" />}
              >
                Refresh Report
              </Button>
            </div>
          </div>

          {/* Section 8 Daily Report Quota Accounting Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-lg">
              <span className="text-blue-600 block text-[10px] font-medium">Existing Confirmed Today</span>
              <span className="font-bold text-blue-950 text-sm">{dailyReport.existingConfirmedToday ?? 0}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px] font-medium">Campaign Submissions Attempted</span>
              <span className="font-bold text-slate-900 text-sm">{dailyReport.campaignSubmissionsAttempted ?? 0}</span>
            </div>
            <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg">
              <span className="text-emerald-700 block text-[10px] font-medium">Campaign Submissions Confirmed</span>
              <span className="font-bold text-emerald-950 text-sm">{dailyReport.campaignSubmissionsConfirmed ?? 0}</span>
            </div>
            <div className="p-2.5 bg-purple-50/50 border border-purple-200 rounded-lg">
              <span className="text-purple-700 block text-[10px] font-medium">Outcome Unknown / Locked</span>
              <span className="font-bold text-purple-950 text-sm">{dailyReport.outcomeUnknownCount ?? 0}</span>
            </div>
            <div className="p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg">
              <span className="text-amber-700 block text-[10px] font-medium">Daily Quota Used</span>
              <span className="font-bold text-amber-950 text-sm">{dailyReport.dailyQuotaUsed}</span>
            </div>
            <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg">
              <span className="text-emerald-700 block text-[10px] font-medium">Daily Quota Remaining</span>
              <span className="font-bold text-emerald-950 text-sm">{dailyReport.dailyQuotaRemaining}</span>
            </div>
          </div>

          {/* Phase 033: Post-Application Outcome Intelligence Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
            <div className="p-2 bg-blue-50/50 border border-blue-200/80 rounded-lg">
              <span className="text-blue-700 block text-[10px] font-medium">Employer Responses</span>
              <span className="font-bold text-blue-950 text-sm">{dailyReport.employerResponsesCount ?? 0}</span>
            </div>
            <div className="p-2 bg-purple-50/50 border border-purple-200/80 rounded-lg">
              <span className="text-purple-700 block text-[10px] font-medium">Interviews</span>
              <span className="font-bold text-purple-950 text-sm">{dailyReport.interviewsCount ?? 0}</span>
            </div>
            <div className="p-2 bg-cyan-50/50 border border-cyan-200/80 rounded-lg">
              <span className="text-cyan-700 block text-[10px] font-medium">Assessments</span>
              <span className="font-bold text-cyan-950 text-sm">{dailyReport.assessmentsCount ?? 0}</span>
            </div>
            <div className="p-2 bg-rose-50/50 border border-rose-200/80 rounded-lg">
              <span className="text-rose-700 block text-[10px] font-medium">Rejections</span>
              <span className="font-bold text-rose-950 text-sm">{dailyReport.rejectionsCount ?? 0}</span>
            </div>
            <div className="p-2 bg-emerald-50/50 border border-emerald-200/80 rounded-lg">
              <span className="text-emerald-700 block text-[10px] font-medium">Offers</span>
              <span className="font-bold text-emerald-950 text-sm">{dailyReport.offersCount ?? 0}</span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px] font-medium">Unmatched Emails</span>
              <span className="font-bold text-slate-800 text-sm">{dailyReport.unmatchedMessagesCount ?? 0}</span>
            </div>
            <div className="p-2 bg-amber-50/50 border border-amber-200/80 rounded-lg">
              <span className="text-amber-700 block text-[10px] font-medium">Needs Review</span>
              <span className="font-bold text-amber-950 text-sm">{dailyReport.needsReviewCount ?? 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Total Discovered</span>
              <span className="font-bold text-slate-900 text-sm">{dailyReport.discoveryCount}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Qualified Postings</span>
              <span className="font-bold text-slate-900 text-sm">{dailyReport.qualifiedCount}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Fresh Verified</span>
              <span className="font-bold text-emerald-700 text-sm">{dailyReport.freshVerifiedCount}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Eligible Auto-Apply</span>
              <span className="font-bold text-blue-700 text-sm">{dailyReport.eligibleAutoApplyCount}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Hard Blocked</span>
              <span className="font-bold text-rose-700 text-sm">{dailyReport.blockedCount}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Skipped (Quota)</span>
              <span className="font-bold text-amber-700 text-sm">{dailyReport.skippedCount}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Locked / Ambiguous</span>
              <span className="font-bold text-purple-700 text-sm">{dailyReport.outcomeUnknownCount}</span>
            </div>
          </div>

          {/* Top Eligible Candidates Table from Report */}
          {dailyReport.topEligibleCandidates.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0F172A]">Top Candidate Queue (Prioritized Newest-First)</h4>
              <div className="border border-[#E2E8F0] rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                      <th className="py-2.5 px-3">Role & Company</th>
                      <th className="py-2.5 px-3">ATS</th>
                      <th className="py-2.5 px-3">Fit %</th>
                      <th className="py-2.5 px-3">Readiness</th>
                      <th className="py-2.5 px-3">Policy</th>
                      <th className="py-2.5 px-3">Freshness</th>
                      <th className="py-2.5 px-3">Duplicate</th>
                      <th className="py-2.5 px-3">Eligibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyReport.topEligibleCandidates.map((c) => (
                      <tr key={c.jobId} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#0F172A]">{c.roleTitle}</div>
                          <div className="text-[11px] text-[#64748B]">{c.companyName}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono uppercase text-[11px] text-[#475569]">
                          {c.atsProvider}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0F172A]">{c.fitScore}%</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                            {c.readinessState}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px]">{c.policyDecision}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            c.freshnessStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {c.freshnessStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[10px] font-mono text-slate-600">
                          {c.duplicateStatus}
                        </td>
                        <td className="py-2.5 px-3">
                          {c.eligible ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ELIGIBLE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>INELIGIBLE</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Queue Evaluation & Controls Bar */}
      <Card className="p-5 border border-[#E2E8F0] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Candidate Queue Evaluation</h3>
            <p className="text-xs text-[#64748B]">
              Deterministic 9-gate dry-run evaluation. Analyzes fresh postings without performing submissions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowConfigModal(true)}
              icon={<Sliders className="w-3.5 h-3.5" />}
            >
              Limits & Thresholds
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleEvaluateQueue}
              disabled={isEvaluating}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />}
            >
              {isEvaluating ? 'Evaluating Gates...' : 'Evaluate Queue (Dry-Run)'}
            </Button>
          </div>
        </div>

        {/* Evaluation Summary Pills */}
        {evaluation && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-[#64748B]">Total Evaluated: </span>
              <span className="font-bold text-[#0F172A]">{evaluation.totalEvaluated}</span>
            </div>
            <div className="text-emerald-700 font-medium">
              <span>Eligible for Today: </span>
              <span className="font-bold">{evaluation.eligibleCount}</span>
            </div>
            <div className="text-rose-700 font-medium">
              <span>Hard Blocked: </span>
              <span className="font-bold">{evaluation.blockedCount}</span>
            </div>
            <div className="text-amber-700 font-medium">
              <span>Skipped (Quota/Limits): </span>
              <span className="font-bold">{evaluation.skippedCount}</span>
            </div>
            <span className="text-[10px] text-slate-400 ml-auto">
              Evaluated at: {new Date(evaluation.evaluatedAt).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Evaluated Candidates Table */}
        {evaluation && evaluation.candidates.length > 0 ? (
          <div className="border border-[#E2E8F0] rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-2.5 px-3">Role & Company</th>
                  <th className="py-2.5 px-3">ATS</th>
                  <th className="py-2.5 px-3">Fit Score</th>
                  <th className="py-2.5 px-3">Readiness State</th>
                  <th className="py-2.5 px-3">Policy Decision</th>
                  <th className="py-2.5 px-3">Gate Outcome</th>
                  <th className="py-2.5 px-3">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evaluation.candidates.map((c) => (
                  <tr key={c.jobId} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#0F172A]">{c.roleTitle}</div>
                      <div className="text-[11px] text-[#64748B]">{c.companyName}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono uppercase text-[11px] text-[#475569]">
                      {c.atsProvider}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#0F172A]">
                      {c.fitScore}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {c.readinessState}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {c.decision}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {c.eligible ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ELIGIBLE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>INELIGIBLE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] max-w-xs">
                      <span className="line-clamp-1">{c.skipOrBlockReason || 'Meets all 9 campaign safety gates'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-[#64748B]">
            Click <span className="font-semibold text-[#0F172A]">Evaluate Queue (Dry-Run)</span> to preview eligible postings against today's safety gates.
          </div>
        )}
      </Card>

      {/* Historical Campaign Runs */}
      <Card className="p-5 border border-[#E2E8F0] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Daily Campaign History</h3>
            <p className="text-xs text-[#64748B]">Audit log of past autonomous runs and safety gate records.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            icon={<RefreshCw className="w-3 h-3" />}
          >
            Refresh
          </Button>
        </div>

        {runs.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#64748B] bg-slate-50 rounded-lg">
            No autonomous campaign runs logged yet. The campaign is disabled by default.
          </div>
        ) : (
          <div className="border border-[#E2E8F0] rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-2.5 px-3">Run ID</th>
                  <th className="py-2.5 px-3">Started</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Evaluated</th>
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3">Confirmed</th>
                  <th className="py-2.5 px-3">Blocked</th>
                  <th className="py-2.5 px-3">Unknown Outcomes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {runs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{r.id}</td>
                    <td className="py-2.5 px-3 text-[#64748B]">
                      {new Date(r.startedAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono uppercase text-[11px]">
                      <span className={`px-1.5 py-0.5 rounded ${
                        r.status === 'COMPLETED' || r.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'DRY_RUN'
                          ? 'bg-blue-100 text-blue-800'
                          : r.status === 'EMERGENCY_STOPPED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#0F172A]">{r.candidatesEvaluated}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-600">{r.applicationsSubmitted}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">
                      {r.applicationsConfirmed ?? r.successfulConfirmations ?? 0}
                    </td>
                    <td className="py-2.5 px-3 text-rose-600">{r.blockedCount}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-600">
                      {r.outcomeUnknownCount ?? r.unknownOutcomesCount ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Explicit Confirmation Modal: Arm Stage 1 Campaign */}
      {showArmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#0F172A]">Confirm Stage 1 Campaign Arming</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              You are about to arm the autonomous campaign under strict Stage 1 controlled activation:
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 font-mono text-slate-700">
              <div>- Daily maximum: <strong>1 application per calendar day</strong></div>
              <div>- Minimum Fit Score: <strong>85%</strong></div>
              <div>- Minimum Readiness Score: <strong>90%</strong></div>
              <div>- Per-Company daily limit: <strong>1</strong></div>
              <div>- Per-ATS daily limit: <strong>1</strong></div>
              <div>- Genuine positive ATS employer confirmation strictly required</div>
              <div>- Ambiguous outcomes lock daily quota slot pending manual reconciliation</div>
            </div>
            <p className="text-[11px] text-rose-700 font-semibold">
              Are you sure you want to proceed with arming the campaign?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowArmModal(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleArmStage1}
                disabled={isUpdating}
                icon={<Play className="w-3.5 h-3.5" />}
              >
                {isUpdating ? 'Arming...' : 'Confirm & Arm 1/day Campaign'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Limits & Thresholds Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">Configure Campaign Safety Limits</h3>
            <p className="text-xs text-[#64748B]">
              Deterministic thresholds enforced across all autonomous applications.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Daily Application Cap (Max per day)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editLimit}
                  onChange={(e) => setEditLimit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Minimum Fit Score Threshold (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={editFit}
                  onChange={(e) => setEditFit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Minimum Readiness Score Threshold (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={editReady}
                  onChange={(e) => setEditReady(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Max Applications Per Company Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editCompanyLimit}
                  onChange={(e) => setEditCompanyLimit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Max Applications Per ATS Provider Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editAtsLimit}
                  onChange={(e) => setEditAtsLimit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isUpdating}>
                  Save Limits
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
