export interface SourceAttribution {
  label: string;
  sourceType: 'Aggregator' | 'Direct ATS' | 'Company Careers' | 'Referral' | 'Board';
  colorClasses: string;
  dotColor: string;
}

export interface ApplicationRouteAttribution {
  label: string;
  description: string;
  badgeClasses: string;
  iconType: 'careers' | 'referral' | 'recruiter' | 'board';
}

/**
 * Determine high-fidelity human-readable source and origin branding.
 */
export function getSourceAttribution(source?: string | null, sourceUrl?: string | null): SourceAttribution {
  const s = (source || '').toLowerCase();
  const url = (sourceUrl || '').toLowerCase();

  if (url.includes('boards.greenhouse.io') || url.includes('greenhouse.io') || s.includes('greenhouse')) {
    return {
      label: 'Greenhouse ATS',
      sourceType: 'Direct ATS',
      colorClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
    };
  }

  if (url.includes('jobs.lever.co') || url.includes('lever.co') || s.includes('lever')) {
    return {
      label: 'Lever ATS',
      sourceType: 'Direct ATS',
      colorClasses: 'bg-teal-50 text-teal-700 border-teal-200',
      dotColor: 'bg-teal-500',
    };
  }

  if (url.includes('personio') || s.includes('personio')) {
    return {
      label: 'Personio ATS',
      sourceType: 'Direct ATS',
      colorClasses: 'bg-amber-50 text-amber-700 border-amber-200',
      dotColor: 'bg-amber-500',
    };
  }

  if (url.includes('myworkdayjobs') || url.includes('workday') || s.includes('workday')) {
    return {
      label: 'Workday ATS',
      sourceType: 'Direct ATS',
      colorClasses: 'bg-orange-50 text-orange-700 border-orange-200',
      dotColor: 'bg-orange-500',
    };
  }

  if (url.includes('linkedin.com') || s.includes('linkedin')) {
    return {
      label: 'LinkedIn',
      sourceType: 'Aggregator',
      colorClasses: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-[#0A66C2]',
    };
  }

  if (s.includes('careers') || s.includes('company')) {
    return {
      label: 'Company Careers',
      sourceType: 'Company Careers',
      colorClasses: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dotColor: 'bg-indigo-500',
    };
  }

  return {
    label: source || 'Direct Portal',
    sourceType: 'Company Careers',
    colorClasses: 'bg-slate-50 text-slate-700 border-slate-200',
    dotColor: 'bg-slate-500',
  };
}

/**
 * Format raw application_route identifiers into professional recruitment workflow labels.
 */
export function getApplicationRouteAttribution(route?: string | null): ApplicationRouteAttribution {
  const r = (route || '').toLowerCase().replace(/[\s-]/g, '_');

  switch (r) {
    case 'company_careers':
    case 'companycareers':
      return {
        label: 'Direct Company Careers',
        description: 'Direct submission via official hiring portal',
        badgeClasses: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        iconType: 'careers',
      };
    case 'employee_referral':
    case 'referral':
      return {
        label: 'Employee Referral',
        description: 'Warm internal endorsement through contact',
        badgeClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconType: 'referral',
      };
    case 'recruiter_outreach':
    case 'recruiter':
      return {
        label: 'Recruiter Outreach',
        description: 'Direct recruiter conversation / active outreach',
        badgeClasses: 'bg-purple-50 text-purple-700 border-purple-200',
        iconType: 'recruiter',
      };
    case 'external_job_board':
    case 'job_board':
    default:
      return {
        label: 'Target ATS via Aggregator',
        description: 'External applicant tracking system link via board',
        badgeClasses: 'bg-slate-50 text-slate-700 border-slate-200',
        iconType: 'board',
      };
  }
}
