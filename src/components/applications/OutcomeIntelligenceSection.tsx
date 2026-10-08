import React, { useState } from 'react';
import {
  ApplicationOutcomeDetail,
  ApplicationOutcomeState,
  RejectionReason,
  TimelineEventType,
} from '../../types';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Award,
  FileText,
  XCircle,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Briefcase,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { applicationsApi } from '../../api';

interface OutcomeIntelligenceSectionProps {
  outcome: ApplicationOutcomeDetail;
  onRefresh?: () => void;
}

export const OutcomeIntelligenceSection: React.FC<OutcomeIntelligenceSectionProps> = ({
  outcome,
  onRefresh,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await applicationsApi.syncOutcomes();
      setSyncStatus(`Sync complete: scanned ${res.messagesScanned} emails, updated ${res.applicationsUpdated} applications.`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setSyncStatus(`Sync error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const getOutcomeBadge = (state: ApplicationOutcomeState) => {
    switch (state) {
      case 'OFFER':
        return {
          label: 'Offer Extended',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: Award,
        };
      case 'INTERVIEW_SCHEDULED':
        return {
          label: 'Interview Scheduled',
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          icon: Calendar,
        };
      case 'INTERVIEW_INVITATION':
        return {
          label: 'Interview Invitation',
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: Calendar,
        };
      case 'ASSESSMENT':
        return {
          label: 'Assessment / Challenge',
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          icon: FileText,
        };
      case 'APPLICATION_RECEIVED':
        return {
          label: 'Receipt Confirmed',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: CheckCircle,
        };
      case 'RECRUITER_RESPONSE':
        return {
          label: 'Recruiter Inquired',
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          icon: MessageSquare,
        };
      case 'REJECTION':
        return {
          label: 'Application Rejected',
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: XCircle,
        };
      case 'NO_RESPONSE':
        return {
          label: 'No Response Yet',
          bg: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
          icon: Clock,
        };
      default:
        return {
          label: 'Unknown Outcome',
          bg: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
          icon: HelpCircle,
        };
    }
  };

  const badge = getOutcomeBadge(outcome.outcomeState);
  const BadgeIcon = badge.icon;

  const getTimelineEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'SUBMISSION':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'CONFIRMATION':
        return <CheckCircle className="w-4 h-4 text-amber-400" />;
      case 'EMPLOYER_RESPONSE':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'ASSESSMENT':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'INTERVIEW':
        return <Calendar className="w-4 h-4 text-indigo-400" />;
      case 'REJECTION':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'OFFER':
        return <Award className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatRejectionReason = (reason?: RejectionReason | null) => {
    switch (reason) {
      case 'SPECIFIC_REQUIREMENT_REJECTION':
        return 'Specific Requirement Stated (Language, Visa, or Specific Qualification)';
      case 'GENERIC_COMPETITIVE_REJECTION':
        return 'Generic Competitive Pool (High Applicant Volume)';
      case 'UNKNOWN_REJECTION_REASON':
      default:
        return 'Unstated / General Decision (No Fabricated Reason)';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">Application Outcome Intelligence</h3>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.bg}`}
            >
              <BadgeIcon className="w-3.5 h-3.5" />
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded employer observation linked deterministically via read-only Gmail sync
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Outcomes'}
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="p-3 text-xs rounded-lg bg-blue-900/20 border border-blue-800/40 text-blue-300">
          {syncStatus}
        </div>
      )}

      {/* Outcome Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Latest Response Info */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
          <span className="text-xs text-slate-400 block mb-1">Latest Communication</span>
          <div className="text-sm font-medium text-slate-200 truncate">
            {outcome.latestSubject || (outcome.outcomeState === 'NO_RESPONSE' ? 'Awaiting response' : 'No subject recorded')}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {outcome.latestResponseAt
              ? new Date(outcome.latestResponseAt).toLocaleString()
              : 'No response received yet'}
          </div>
        </div>

        {/* Response Metrics */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
          <span className="text-xs text-slate-400 block mb-1">Response-Time Metrics</span>
          <div className="text-sm font-semibold text-slate-200">
            {outcome.responseTimeMetrics?.submissionToFirstResponseHours !== null &&
            outcome.responseTimeMetrics?.submissionToFirstResponseHours !== undefined
              ? `${outcome.responseTimeMetrics.submissionToFirstResponseHours} hours to first reply`
              : outcome.outcomeState === 'NO_RESPONSE'
              ? 'Response pending'
              : 'Timestamp unavailable'}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {outcome.responseTimeMetrics?.submissionToInterviewDays !== null &&
            outcome.responseTimeMetrics?.submissionToInterviewDays !== undefined ? (
              <span className="text-purple-400 font-medium">
                {outcome.responseTimeMetrics.submissionToInterviewDays} days to interview
              </span>
            ) : outcome.responseTimeMetrics?.submissionToRejectionDays !== null &&
              outcome.responseTimeMetrics?.submissionToRejectionDays !== undefined ? (
              <span className="text-rose-400 font-medium">
                {outcome.responseTimeMetrics.submissionToRejectionDays} days to rejection
              </span>
            ) : (
              'Monitored live'
            )}
          </div>
        </div>

        {/* Recommended Action */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
          <span className="text-xs text-slate-400 block mb-1">Next Attention</span>
          <div className="text-xs font-medium text-amber-300 flex items-start gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{outcome.nextRecommendedAction || 'Monitor incoming communications.'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Confidence: <span className="text-slate-300 font-medium">{outcome.confidence}</span> • Version:{' '}
            <span className="text-slate-300">{outcome.classifierVersion}</span>
          </div>
        </div>
      </div>

      {/* Rejection Intelligence Banner (When Rejected) */}
      {outcome.outcomeState === 'REJECTION' && (
        <div className="bg-rose-950/30 border border-rose-800/40 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Rejection Intelligence</span>
          </div>
          <p className="text-xs text-slate-300">
            <strong>Classification:</strong> {formatRejectionReason(outcome.rejectionReason)}
          </p>
          {outcome.evidenceSnippet && (
            <div className="p-2.5 rounded bg-black/40 border border-rose-900/30 text-xs font-mono text-slate-300">
              "{outcome.evidenceSnippet}"
            </div>
          )}
          <p className="text-[11px] text-slate-400 italic">
            Zero speculation policy: Rejection reasons are only assigned when explicitly declared in employer text.
          </p>
        </div>
      )}

      {/* Evidence Quote if available and not already shown */}
      {outcome.outcomeState !== 'REJECTION' && outcome.evidenceSnippet && (
        <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Classification Evidence
          </span>
          <p className="text-xs font-mono text-slate-300">"{outcome.evidenceSnippet}"</p>
        </div>
      )}

      {/* Chronological Event Timeline */}
      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          Application Event Timeline
        </h4>

        {outcome.timeline.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 text-center">
            No events recorded yet. Click "Sync Outcomes" to pull recent status.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {outcome.timeline.map((event) => (
              <div key={event.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-6 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 border border-slate-700 shadow">
                  {getTimelineEventIcon(event.eventType)}
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-200">{event.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                  {event.evidenceSnippet && (
                    <div className="mt-2 p-2 rounded bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
                      "{event.evidenceSnippet}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
