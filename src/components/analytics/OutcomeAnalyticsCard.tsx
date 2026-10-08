import React, { useEffect, useState } from 'react';
import { OutcomeAnalyticsResponse } from '../../types';
import { analyticsApi } from '../../api';
import {
  BarChart3,
  CheckCircle,
  Clock,
  Award,
  Calendar,
  XCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const OutcomeAnalyticsCard: React.FC = () => {
  const [data, setData] = useState<OutcomeAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getOutcomeAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load outcome analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
        <span className="text-xs">Loading application outcome analytics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400 text-center">
        <p className="text-xs text-rose-400 mb-2">{error || 'No outcome data available'}</p>
        <button
          onClick={fetchAnalytics}
          className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const summary = data.outcomesSummary || {};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Post-Application Outcome Intelligence</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded observation across {data.totalApplications} applications and linked email responses
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Outcome Funnel Totals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-center">
          <span className="text-[11px] text-slate-400 block mb-1">Submitted</span>
          <span className="text-lg font-bold text-white">{data.totalSubmitted}</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-center">
          <span className="text-[11px] text-slate-400 block mb-1">No Response</span>
          <span className="text-lg font-bold text-slate-300">{summary['NO_RESPONSE'] || 0}</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-center">
          <span className="text-[11px] text-amber-400 block mb-1">Receipt Conf.</span>
          <span className="text-lg font-bold text-amber-300">{summary['APPLICATION_RECEIVED'] || 0}</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-center">
          <span className="text-[11px] text-blue-400 block mb-1">Recruiter Inq.</span>
          <span className="text-lg font-bold text-blue-300">{summary['RECRUITER_RESPONSE'] || 0}</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-center">
          <span className="text-[11px] text-cyan-400 block mb-1">Assessment</span>
          <span className="text-lg font-bold text-cyan-300">{summary['ASSESSMENT'] || 0}</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-center">
          <span className="text-[11px] text-purple-400 block mb-1">Interview</span>
          <span className="text-lg font-bold text-purple-300">
            {(summary['INTERVIEW_INVITATION'] || 0) + (summary['INTERVIEW_SCHEDULED'] || 0)}
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-center">
          <span className="text-[11px] text-rose-400 block mb-1">Rejected</span>
          <span className="text-lg font-bold text-rose-300">{summary['REJECTION'] || 0}</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-center">
          <span className="text-[11px] text-emerald-400 block mb-1">Offer</span>
          <span className="text-lg font-bold text-emerald-300">{summary['OFFER'] || 0}</span>
        </div>
      </div>

      {/* Response Time Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Time to First Reply
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">
              {data.medianResponseTimes?.submissionToFirstResponseHours !== null &&
              data.medianResponseTimes?.submissionToFirstResponseHours !== undefined
                ? `${data.medianResponseTimes.submissionToFirstResponseHours}h`
                : 'N/A'}
            </span>
            <span className="text-xs text-slate-400">median</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Average:{' '}
            {data.averageResponseTimes?.submissionToFirstResponseHours !== null &&
            data.averageResponseTimes?.submissionToFirstResponseHours !== undefined
              ? `${data.averageResponseTimes.submissionToFirstResponseHours}h`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            Time to Interview Invitation
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">
              {data.medianResponseTimes?.submissionToInterviewDays !== null &&
              data.medianResponseTimes?.submissionToInterviewDays !== undefined
                ? `${data.medianResponseTimes.submissionToInterviewDays}d`
                : 'N/A'}
            </span>
            <span className="text-xs text-slate-400">median</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Average:{' '}
            {data.averageResponseTimes?.submissionToInterviewDays !== null &&
            data.averageResponseTimes?.submissionToInterviewDays !== undefined
              ? `${data.averageResponseTimes.submissionToInterviewDays}d`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Time to Rejection Decision
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">
              {data.medianResponseTimes?.submissionToRejectionDays !== null &&
              data.medianResponseTimes?.submissionToRejectionDays !== undefined
                ? `${data.medianResponseTimes.submissionToRejectionDays}d`
                : 'N/A'}
            </span>
            <span className="text-xs text-slate-400">median</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Average:{' '}
            {data.averageResponseTimes?.submissionToRejectionDays !== null &&
            data.averageResponseTimes?.submissionToRejectionDays !== undefined
              ? `${data.averageResponseTimes.submissionToRejectionDays}d`
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Fit Score Band Analysis Table */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Observational Outcome by Fit Score Band
        </h4>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-medium">
              <tr>
                <th className="p-3">Fit Band</th>
                <th className="p-3">Sample (N)</th>
                <th className="p-3">No Response</th>
                <th className="p-3">Recruiter / Ack</th>
                <th className="p-3">Interviews</th>
                <th className="p-3">Interview Rate</th>
                <th className="p-3">Rejections</th>
                <th className="p-3">Rejection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {data.fitBandAnalysis.map((b) => (
                <tr key={b.band} className="hover:bg-slate-850/50">
                  <td className="p-3 font-semibold text-slate-200">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs">
                      {b.band}%
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-mono">N = {b.sampleCount}</td>
                  <td className="p-3 text-slate-400">{b.noResponseCount}</td>
                  <td className="p-3 text-slate-300">
                    {b.recruiterResponseCount + b.assessmentCount}
                  </td>
                  <td className="p-3 text-purple-400 font-semibold">{b.interviewCount}</td>
                  <td className="p-3 text-purple-400 font-mono">
                    {(b.interviewRate * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 text-rose-400 font-semibold">{b.rejectionCount}</td>
                  <td className="p-3 text-rose-400 font-mono">
                    {(b.rejectionRate * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ATS & German Requirement Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATS Breakdown */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            ATS Platform Breakdown
          </h5>
          <div className="space-y-1.5">
            {data.atsComparison.map((item) => (
              <div
                key={item.dimensionValue}
                className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-slate-800/80 text-xs"
              >
                <div>
                  <span className="font-medium text-slate-200">{item.dimensionValue}</span>
                  <span className="text-[11px] text-slate-400 ml-2">N = {item.sampleCount}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-purple-400">
                    {item.interviewCount} inv ({(item.interviewRate * 100).toFixed(0)}%)
                  </span>
                  <span className="text-rose-400">
                    {item.rejectionCount} rej ({(item.rejectionRate * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* German Language Requirement Breakdown */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            German Language Requirement
          </h5>
          <div className="space-y-1.5">
            {data.germanRequirementComparison.map((item) => (
              <div
                key={item.dimensionValue}
                className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-slate-800/80 text-xs"
              >
                <div>
                  <span className="font-medium text-slate-200">{item.dimensionValue}</span>
                  <span className="text-[11px] text-slate-400 ml-2">N = {item.sampleCount}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-purple-400">
                    {item.interviewCount} inv ({(item.interviewRate * 100).toFixed(0)}%)
                  </span>
                  <span className="text-rose-400">
                    {item.rejectionCount} rej ({(item.rejectionRate * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mandatory Observational Notice */}
      <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/90 leading-relaxed">
          <strong>Observational Analytics Notice:</strong> {data.disclaimer} Fit Score evaluation weights remain strictly invariant and are never adjusted automatically from small-sample outcome observations.
        </p>
      </div>
    </div>
  );
};
