import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Application } from '../../types';

export interface ValidationChecklistProps {
  checklist: Application['validationChecklist'];
  onToggleItem?: (key: keyof Application['validationChecklist']) => void;
  readOnly?: boolean;
}

export const ValidationChecklist: React.FC<ValidationChecklistProps> = ({
  checklist,
  onToggleItem,
  readOnly = false,
}) => {
  const items: { key: keyof Application['validationChecklist']; label: string }[] = [
    { key: 'correctJob', label: 'Correct Job Position Matched' },
    { key: 'correctCompany', label: 'Correct German Company Verified' },
    { key: 'correctCV', label: 'Tailored CV Variant Attached' },
    { key: 'coverLetterReady', label: 'Targeted Cover Letter Ready' },
    { key: 'requiredQuestionsAnswered', label: 'Required Questions Answered' },
    { key: 'workAuthorizationVerified', label: 'Work Authorization Answer Verified' },
    { key: 'noticePeriodVerified', label: 'Notice Period & Availability Stated' },
    { key: 'noFabricatedInfo', label: 'No Fabricated Experience Claims' },
    { key: 'noMissingRequiredFields', label: 'No Missing Mandatory Fields' },
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = items.length;
  const isAllReady = completedCount === totalCount;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
        <div>
          <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
            Pre-Flight Validation Checklist
          </h4>
          <span className="text-[11px] text-[#64748B]">
            Required before any application submission
          </span>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${
            isAllReady
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {completedCount} / {totalCount} Ready
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => {
          const isChecked = checklist[item.key];
          return (
            <div
              key={item.key}
              onClick={() => !readOnly && onToggleItem && onToggleItem(item.key)}
              className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                readOnly ? '' : 'cursor-pointer hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {isChecked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span
                  className={isChecked ? 'text-[#0F172A] font-medium' : 'text-[#64748B]'}
                >
                  {item.label}
                </span>
              </div>
              <span
                className={`text-[10px] uppercase font-semibold tracking-wider ${
                  isChecked ? 'text-emerald-700' : 'text-amber-600'
                }`}
              >
                {isChecked ? 'Pass' : 'Check'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
