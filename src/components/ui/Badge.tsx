import React from 'react';
import { FitLevel, EvidenceStatus, PipelineStage, AutomationState } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const FitBadge: React.FC<{ fit: FitLevel; size?: 'sm' | 'md' }> = ({ fit, size = 'sm' }) => {
  const map: Record<FitLevel, { variant: BadgeProps['variant']; label: string }> = {
    Strong: { variant: 'green', label: 'Strong Fit' },
    Good: { variant: 'blue', label: 'Good Fit' },
    Moderate: { variant: 'amber', label: 'Moderate Fit' },
    Weak: { variant: 'gray', label: 'Weak Fit' },
  };

  const config = map[fit] || map.Moderate;

  return (
    <Badge variant={config.variant} size={size}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {config.label}
    </Badge>
  );
};

export const EvidenceBadge: React.FC<{ status: EvidenceStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  const map: Record<EvidenceStatus, { variant: BadgeProps['variant']; icon: string }> = {
    'Confirmed by Source': { variant: 'green', icon: '✓' },
    'Evidence Found': { variant: 'blue', icon: 'ℹ' },
    Unknown: { variant: 'gray', icon: '?' },
    Contradictory: { variant: 'red', icon: '✕' },
  };

  const config = map[status] || map.Unknown;

  return (
    <Badge variant={config.variant} size={size}>
      <span className="mr-1 text-[11px] font-bold">{config.icon}</span>
      {status}
    </Badge>
  );
};

export const StatusBadge: React.FC<{ stage: PipelineStage; size?: 'sm' | 'md' }> = ({
  stage,
  size = 'sm',
}) => {
  const map: Record<PipelineStage, BadgeProps['variant']> = {
    Discovered: 'gray',
    Qualified: 'blue',
    Preparing: 'amber',
    Ready: 'purple',
    Applied: 'blue',
    'Recruiter Screen': 'amber',
    Interview: 'green',
    Offer: 'green',
    Rejected: 'red',
    Withdrawn: 'gray',
    Closed: 'gray',
  };

  return (
    <Badge variant={map[stage] || 'gray'} size={size}>
      {stage}
    </Badge>
  );
};

export const AutomationBadge: React.FC<{ state: AutomationState }> = ({ state }) => {
  const map: Record<AutomationState, BadgeProps['variant']> = {
    'AI Prepared': 'purple',
    'Human Review': 'amber',
    Ready: 'green',
    'Automation Running': 'blue',
    Submitted: 'green',
    'Needs Attention': 'red',
  };

  return (
    <Badge variant={map[state] || 'gray'}>
      {state === 'Automation Running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping mr-1.5" />
      )}
      {state}
    </Badge>
  );
};

export const ClaimBadge: React.FC<{
  status: 'Verified' | 'Supported by Profile' | 'Needs Attestation / Flagged';
  size?: 'sm' | 'md';
}> = ({ status, size = 'sm' }) => {
  const map: Record<string, { variant: BadgeProps['variant']; icon: string }> = {
    Verified: { variant: 'green', icon: '✓' },
    'Supported by Profile': { variant: 'blue', icon: '•' },
    'Needs Attestation / Flagged': { variant: 'amber', icon: '⚠' },
  };

  const config = map[status] || map['Needs Attestation / Flagged'];

  return (
    <Badge variant={config.variant} size={size}>
      <span className="mr-1 text-[11px] font-bold">{config.icon}</span>
      {status}
    </Badge>
  );
};

