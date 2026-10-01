import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Application } from '../../types';

export interface ValidationChecklistProps {
  checklist: Application['validationChecklist'];
  onToggleItem?: (key: keyof Application['validationChecklist']) => void;
  unverifiedClaimsCount?: number;
  onInspectClaims?: () => void;
  readOnly?: boolean;
}

export const ValidationChecklist: React.FC<ValidationChecklistProps> = ({
  checklist,
  onToggleItem,
  unverifiedClaimsCount = 0,
  onInspectClaims,
  readOnly = false,
}) => {
  const standardItems: { key: keyof Application['validationChecklist']; label: string }[] = [
    { key: 'correctJob', label: 'Correct Job Position Matched' },
    { key: 'correctCompany', label: 'Correct German Company Verified' },
    { key: 'correctCV', label: 'Tailored CV Variant Attached' },
    { key: 'coverLetterReady', label: 'Targeted Cover Letter Ready' },
    { key: 'requiredQuestionsAnswered', label: 'Required Questions Answered' },
    { key: 'workAuthorizationVerified', label: 'Work Authorization Answer Verified' },
    { key: 'noticePeriodVerified', label: 'Notice Period & Availability Stated' },
    { key: 'noFabricatedInfo', label: 'No Fabricated Experience Claims' },
  ];

  const claimsAttested = unverifiedClaimsCount === 0;
  const standardCompletedCount = standardItems.filter((item) => checklist[item.key]).length;
  const completedCount = standardCompletedCount + (claimsAttested ? 1 : 0);
  const totalCount = standardItems.length + 1; // 8 standard + 1 claims verification = 9 total
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
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${
              isAllReady
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {completedCount} / {totalCount} Ready
          </span>
          {!claimsAttested && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {unverifiedClaimsCount} Needs Attestation
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {standardItems.map((item) => {
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
                {isChecked ? 'PASS' : 'CHECK'}
              </span>
            </div>
          );
        })}

        {/* Distinct Unsupported / Unverified Claims row */}
        <div
          onClick={() => {
            if (!claimsAttested && onInspectClaims) {
              onInspectClaims();
            }
          }}
          className={`flex items-start justify-between p-2 rounded-lg text-xs transition-colors ${
            !claimsAttested && onInspectClaims ? 'cursor-pointer hover:bg-amber-50/60 bg-amber-50/30' : ''
          }`}
        >
          <div className="flex items-start gap-2">
            {claimsAttested ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span
                className={claimsAttested ? 'text-[#0F172A] font-medium block' : 'text-[#0F172A] font-medium block'}
              >
                Unsupported / Unverified Claims
              </span>
              {!claimsAttested && (
                <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                  {unverifiedClaimsCount} requires attestation
                </span>
              )}
            </div>
          </div>
          <span
            className={`text-[10px] uppercase font-semibold tracking-wider ${
              claimsAttested
                ? 'text-emerald-700'
                : 'text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded'
            }`}
          >
            {claimsAttested ? 'PASS' : 'REVIEW'}
          </span>
        </div>
      </div>
    </div>
  );
};
