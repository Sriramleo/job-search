import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, ExternalLink, ChevronRight, Eye } from 'lucide-react';
import { Job } from '../../types';
import { FitBadge, EvidenceBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { getSourceAttribution, getApplicationRouteAttribution } from '../../utils/jobSource';

export interface JobTableProps {
  jobs: Job[];
  selectedJobId?: string;
  onSelectJobForPreview: (job: Job) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const JobTable: React.FC<JobTableProps> = ({
  jobs,
  selectedJobId,
  onSelectJobForPreview,
  sortField,
  sortDirection,
  onSort,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent, job: Job) => {
    // If user clicked an action button, don't trigger row selection
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    onSelectJobForPreview(job);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <th className="py-3 px-4 w-[28%]">
                <button
                  onClick={() => onSort && onSort('title')}
                  className="flex items-center gap-1.5 hover:text-[#0F172A]"
                >
                  <span>Job & Role</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 w-[16%]">Company</th>
              <th className="py-3 px-4 w-[14%]">Location & Mode</th>
              <th className="py-3 px-4 w-[12%]">
                <button
                  onClick={() => onSort && onSort('salaryMin')}
                  className="flex items-center gap-1.5 hover:text-[#0F172A]"
                >
                  <span>Salary Band</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 w-[12%] text-center">Technical Fit</th>
              <th className="py-3 px-4 w-[14%]">Relocation Evidence</th>
              <th className="py-3 px-4 w-[14%]">Application Route</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              const displaySkills = job.keySkills.slice(0, 3).join(' · ');
              const remainingCount = Math.max(0, job.keySkills.length - 3);

              return (
                <tr
                  key={job.id}
                  onClick={(e) => handleRowClick(e, job)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected
                      ? 'bg-blue-50/60 ring-1 ring-inset ring-blue-300'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Job & Role */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {job.title}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 flex items-center gap-1.5">
                      <span>{displaySkills}</span>
                      {remainingCount > 0 && (
                        <span className="text-[10px] px-1 py-0.2 bg-slate-100 rounded text-slate-500 font-medium">
                          +{remainingCount}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Company & Source */}
                  <td className="py-3.5 px-4 font-medium text-[#0F172A]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span>{job.companyName}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {(() => {
                          const src = getSourceAttribution(job.source, job.sourceUrl);
                          return (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${src.colorClasses}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${src.dotColor}`} />
                              {src.label}
                            </span>
                          );
                        })()}
                        {(() => {
                          const vStatus = job.verificationStatus || 'UNKNOWN';
                          const verifiedDate = job.lastSuccessfulVerifiedAt || job.lastVerifiedAt;
                          if (vStatus === 'VERIFIED') {
                            return (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                                title={`Verified active${verifiedDate ? ` on ${verifiedDate.slice(0, 10)}` : ''}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Verified Active
                              </span>
                            );
                          }
                          if (vStatus === 'STALE') {
                            return (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
                                title="Posting flagged stale"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Stale
                              </span>
                            );
                          }
                          return (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200"
                              title="Freshness unverified / pending probe"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Unverified
                            </span>
                          );
                        })()}
                      </div>
                      {(() => {
                        const ts = job.discoveredAt || (job as any).discovered_at || job.postedDate || (job as any).posted_date || '';
                        if (!ts) return null;
                        return (
                          <div className="text-[10px] text-slate-400 font-normal">
                            {ts.slice(0, 10)}
                          </div>
                        );
                      })()}
                    </div>
                  </td>

                  {/* Location & Mode */}
                  <td className="py-3.5 px-4 text-[#475569]">
                    <div>{job.location}</div>
                  </td>

                  {/* Salary Band */}
                  <td className="py-3.5 px-4 font-medium text-[#0F172A] tabular-nums whitespace-nowrap">
                    {job.salaryMin && job.salaryMax && job.salaryMin > 0 && job.salaryMax > 0
                      ? `€${(job.salaryMin / 1000).toFixed(0)}K–€${(job.salaryMax / 1000).toFixed(0)}K`
                      : 'Unknown'}
                  </td>

                  {/* Fit Badge */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <FitBadge fit={job.technicalFit} />
                  </td>

                  {/* Relocation */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <EvidenceBadge status={job.relocationStatus} />
                  </td>

                  {/* Route */}
                  <td className="py-3.5 px-4 text-[#475569]">
                    {(() => {
                      const routeAttr = getApplicationRouteAttribution(job.applicationRoute);
                      return (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${routeAttr.badgeClasses}`}
                          title={routeAttr.description}
                        >
                          {routeAttr.label}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {job.applicationUrl && (
                        <a
                          href={job.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={`Open official vacancy (${job.atsType && job.atsType !== 'Unknown' ? job.atsType : 'Direct Link'})`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectJobForPreview(job);
                        }}
                        title="Quick Preview"
                        className="p-1 text-slate-500 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/jobs/${job.id}`);
                        }}
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5 -mr-1" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
