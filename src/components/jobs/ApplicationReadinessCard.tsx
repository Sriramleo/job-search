import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { jobsApi } from '../../api';
import { Job, FitScoreResult, ApplicationReadinessResult, PolicyDecisionResult } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Props {
  job: Job;
}

export const ApplicationReadinessCard: React.FC<Props> = ({ job }) => {
  const [fitScore, setFitScore] = useState<FitScoreResult | null>(null);
  const [readiness, setReadiness] = useState<ApplicationReadinessResult | null>(null);
  const [policy, setPolicy] = useState<PolicyDecisionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchReadiness = async () => {
      setLoading(true);
      try {
        const [fit, ready, pol] = await Promise.allSettled([
          jobsApi.getFitScore(job.id),
          jobsApi.getApplicationReadiness(job.id),
          jobsApi.getPolicyDecision(job.id),
        ]);
        if (active) {
          if (fit.status === 'fulfilled') setFitScore(fit.value);
          if (ready.status === 'fulfilled') setReadiness(ready.value);
          if (pol.status === 'fulfilled') setPolicy(pol.value);
        }
      } catch (err) {
        console.error('Failed to load readiness details:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchReadiness();
    return () => {
      active = false;
    };
  }, [job.id]);

  // No fabricated fallbacks! Strictly real values or loading / not verified
  const hasFit = fitScore?.overallScore !== undefined || (job as any).fitScore !== undefined;
  const scoreVal = fitScore?.overallScore ?? (job as any).fitScore;
  const fitDisplay = loading
    ? 'Loading...'
    : hasFit
    ? `FIT ${scoreVal}%`
    : 'Fit Score Unavailable';

  const rawState = readiness?.state;
  const stateDisplay = loading
    ? 'LOADING'
    : rawState
    ? rawState.replace(/_/g, ' ')
    : 'NOT VERIFIED';

  const rawDecision = policy?.decision;
  const decisionDisplay = loading
    ? 'Loading...'
    : rawDecision
    ? rawDecision.replace(/_/g, ' ')
    : 'Pending Evaluation';

  const realAtsProvider = (
    job.atsType ||
    (job as any).atsProvider ||
    (job as any).ats_provider ||
    job.applicationType ||
    null
  );

  const applyKitCond = readiness?.conditions?.find(
    (c) => c.name === 'Apply Kit Grounding' || c.name === 'Required Documents (CV)'
  );

  const stateColors: Record<string, { bg: string; text: string; border: string }> = {
    AUTO_APPLY_READY: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    HUMAN_APPROVAL_REQUIRED: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    MANUAL_REQUIRED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    BLOCKED: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    ALREADY_APPLIED: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  };

  const currentStyle = rawState && stateColors[rawState] ? stateColors[rawState] : {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <Card className="p-6 border border-[#E2E8F0] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#0F172A] tracking-tight">
              {fitDisplay}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}
            >
              {stateDisplay}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Deterministic evaluation grounded in verified candidate engineering evidence.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] block">
            Policy Decision
          </span>
          <span className="text-sm font-bold text-[#0F172A]">
            {decisionDisplay}
          </span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
          <span className="text-[11px] font-medium text-[#64748B] block">Freshness</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {loading ? (
              <span className="text-slate-500">Loading...</span>
            ) : job.verificationStatus === 'VERIFIED' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700">VERIFIED</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-rose-700">{job.verificationStatus || 'Not verified'}</span>
              </>
            )}
          </div>
        </div>

        <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
          <span className="text-[11px] font-medium text-[#64748B] block">ATS Provider</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A]">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {loading
                ? 'Loading...'
                : realAtsProvider
                ? realAtsProvider
                : 'Not verified / Unavailable'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
          <span className="text-[11px] font-medium text-[#64748B] block">Duplicate Check</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {loading ? (
              <span className="text-slate-500">Checking...</span>
            ) : rawState === 'ALREADY_APPLIED' ? (
              <>
                <AlertCircle className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-purple-700">ALREADY APPLIED</span>
              </>
            ) : readiness ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700">CLEAR</span>
              </>
            ) : (
              <span className="text-slate-500">Not verified</span>
            )}
          </div>
        </div>

        <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
          <span className="text-[11px] font-medium text-[#64748B] block">Apply Kit</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {loading ? (
              <span className="text-slate-500">Loading...</span>
            ) : applyKitCond ? (
              applyKitCond.passed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700">CV & Cover Letter READY</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-rose-700">Apply Kit Incomplete</span>
                </>
              )
            ) : (
              <span className="text-slate-500">Not verified / Unavailable</span>
            )}
          </div>
        </div>
      </div>

      {/* Blockers or Warnings */}
      {readiness?.blockers && readiness.blockers.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-rose-900">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Automation Blockers ({readiness.blockers.length})</span>
          </div>
          <ul className="list-disc pl-5 text-rose-800 space-y-0.5">
            {readiness.blockers.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Fit Score breakdown if available */}
      {fitScore?.components && (
        <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
          <span className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
            Fit Score Component Breakdown
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {fitScore.components.map((c, idx) => (
              <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded">
                <div className="flex justify-between items-center text-[11px] text-[#64748B]">
                  <span>{c.name}</span>
                  <span className="font-bold text-[#0F172A]">{Math.round(c.score)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, c.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety & Positive Confirmation Invariant Guarantee */}
      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-[#64748B] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Verified Execution: Positive employer ATS confirmation required before marking Applied.</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Phase 029/030 Gate</span>
      </div>
    </Card>
  );
};
