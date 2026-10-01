import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Building, Layers } from 'lucide-react';
import { Application, PipelineStage } from '../../types';
import { AutomationBadge } from '../ui/Badge';

export interface ApplicationKanbanProps {
  applications: Application[];
  onMoveStage?: (appId: string, newStage: PipelineStage) => void;
}

export const ApplicationKanban: React.FC<ApplicationKanbanProps> = ({
  applications,
}) => {
  const navigate = useNavigate();

  const stages: { key: PipelineStage; label: string; headerColor: string }[] = [
    { key: 'Qualified', label: 'Qualified', headerColor: 'border-blue-400' },
    { key: 'Preparing', label: 'Preparing', headerColor: 'border-amber-400' },
    { key: 'Ready', label: 'Ready', headerColor: 'border-purple-400' },
    { key: 'Applied', label: 'Applied', headerColor: 'border-blue-500' },
    { key: 'Recruiter Screen', label: 'Screening', headerColor: 'border-indigo-400' },
    { key: 'Interview', label: 'Interview', headerColor: 'border-emerald-500' },
    { key: 'Offer', label: 'Offer', headerColor: 'border-green-600' },
    { key: 'Rejected', label: 'Rejected', headerColor: 'border-slate-300' },
    { key: 'Withdrawn', label: 'Withdrawn', headerColor: 'border-slate-300' },
    { key: 'Closed', label: 'Closed', headerColor: 'border-slate-300' },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[600px] select-none">
      {stages.map((st) => {
        const stageApps = applications.filter((a) => a.stage === st.key);

        return (
          <div
            key={st.key}
            className="w-72 shrink-0 bg-slate-100/70 rounded-xl border border-slate-200/80 flex flex-col max-h-[780px]"
          >
            {/* Column Header */}
            <div
              className={`p-3.5 border-t-3 bg-white rounded-t-xl border-b border-[#E2E8F0] flex items-center justify-between shadow-2xs ${st.headerColor}`}
            >
              <span className="font-semibold text-xs text-[#0F172A] tracking-tight">
                {st.label}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#475569] tabular-nums">
                {stageApps.length}
              </span>
            </div>

            {/* Cards Container */}
            <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5">
              {stageApps.length === 0 ? (
                <div className="p-4 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No applications
                </div>
              ) : (
                stageApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <span className="font-semibold text-xs text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
                        {app.jobTitle}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#475569] font-medium flex items-center gap-1 mb-2">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{app.companyName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-2.5">
                      <span>{app.salaryRange}</span>
                      <span className="truncate max-w-[110px]" title={app.route}>
                        {app.route}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[11px] text-[#0F172A] bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[#64748B] block text-[10px] font-medium uppercase tracking-wider">
                          Next Action
                        </span>
                        <span className="font-medium text-[#475569] line-clamp-2">
                          {app.nextAction}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{app.nextActionDueDate}</span>
                        </span>
                        <AutomationBadge state={app.automationState} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
