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
} from 'lucide-react';
import { campaignApi } from '../../api';
import {
  CampaignConfig,
  CampaignDailyStatus,
  CampaignQueueEvaluationResult,
  CampaignRun,
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
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Edit config state
  const [editLimit, setEditLimit] = useState(5);
  const [editFit, setEditFit] = useState(85);
  const [editReady, setEditReady] = useState(90);
  const [editCompanyLimit, setEditCompanyLimit] = useState(1);
  const [editAtsLimit, setEditAtsLimit] = useState(2);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, runsRes] = await Promise.allSettled([
        campaignApi.getStatus(),
        campaignApi.getRuns(10),
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
    } catch (err) {
      console.error('Failed to load campaign data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCampaign = async () => {
    if (!config) return;
    setIsUpdating(true);
    try {
      const updated = await campaignApi.updateConfig({
        ...config,
        isEnabled: !config.isEnabled,
        emergencyStop: false, // Disabling or enabling clears emergency stop if user deliberately initiates
      });
      setConfig(updated);
      await loadData();
    } catch (err) {
      console.error('Failed to update campaign state:', err);
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
  const isEnabled = config?.isEnabled && !isEmergencyStop;

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
            onClick={handleToggleCampaign}
            disabled={isUpdating}
          >
            Reset Stop & Re-arm
          </Button>
        </div>
      ) : isEnabled ? (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-900 shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-sm block">CAMPAIGN ACTIVE & ARMED</span>
              <span className="text-xs text-emerald-700">
                Daily autonomous pilot running under strict deterministic safety limits ({status?.remainingCapacity || 0} remaining today).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleCampaign}
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
              <span className="font-bold text-sm block">CAMPAIGN STANDBY (DISABLED)</span>
              <span className="text-xs text-[#64748B]">
                Autonomous applications disabled by default. Manual and controlled single applications only.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleToggleCampaign}
              disabled={isUpdating}
              icon={<Play className="w-3.5 h-3.5" />}
            >
              Enable Campaign
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEmergencyStop}
              disabled={isUpdating}
              icon={<ShieldAlert className="w-3.5 h-3.5" />}
            >
              Lockdown Stop
            </Button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Today's Cap</span>
          <span className="text-xl font-bold text-[#0F172A] mt-1 block">
            {config?.dailyMaxApplications ?? 5}
          </span>
          <span className="text-[10px] text-slate-400">Max applications/day</span>
        </Card>

        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Submitted Today</span>
          <span className="text-xl font-bold text-blue-600 mt-1 block">
            {status?.submittedToday ?? 0}
          </span>
          <span className="text-[10px] text-slate-400">Verified real apps</span>
        </Card>

        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Remaining Quota</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">
            {status?.remainingCapacity ?? 0}
          </span>
          <span className="text-[10px] text-slate-400">Daily capacity left</span>
        </Card>

        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Min Fit Score</span>
          <span className="text-xl font-bold text-[#0F172A] mt-1 block">
            {config?.minFitScore ?? 85}%
          </span>
          <span className="text-[10px] text-slate-400">Hard qualification floor</span>
        </Card>

        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Per-Company Cap</span>
          <span className="text-xl font-bold text-[#0F172A] mt-1 block">
            {config?.maxPerCompanyDaily ?? 1}
          </span>
          <span className="text-[10px] text-slate-400">Max/employer daily</span>
        </Card>

        <Card className="p-3 bg-white border border-[#E2E8F0]">
          <span className="text-[11px] font-medium text-[#64748B] block">Per-ATS Cap</span>
          <span className="text-xl font-bold text-[#0F172A] mt-1 block">
            {config?.maxPerAtsDaily ?? 2}
          </span>
          <span className="text-[10px] text-slate-400">Max/provider daily</span>
        </Card>
      </div>

      {/* Queue Evaluation & Controls Bar */}
      <Card className="p-5 border border-[#E2E8F0] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Candidate Queue & Safety Gates</h3>
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
                        r.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'aborted'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#0F172A]">{r.candidatesEvaluated}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-600">{r.applicationsSubmitted}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">{r.successfulConfirmations}</td>
                    <td className="py-2.5 px-3 text-rose-600">{r.blockedCount}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-600">{r.unknownOutcomesCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
