import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  header,
  footer,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden transition-all ${className}`}
    >
      {header && (
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export interface KPIProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: string;
  icon?: React.ReactNode;
  status?: 'default' | 'success' | 'warning' | 'purple';
}

export const KPI: React.FC<KPIProps> = ({
  title,
  value,
  subtitle,
  icon,
  status = 'default',
}) => {
  const statusAccent = {
    default: 'text-[#2563EB]',
    success: 'text-[#16A34A]',
    warning: 'text-[#D97706]',
    purple: 'text-[#7C3AED]',
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex items-center justify-between">
      <div>
        <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider block">
          {title}
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {value}
          </span>
          {subtitle && (
            <span className="text-xs text-[#64748B]">{subtitle}</span>
          )}
        </div>
      </div>
      {icon && (
        <div className={`p-2.5 rounded-lg bg-slate-50 border border-slate-100 ${statusAccent[status]}`}>
          {icon}
        </div>
      )}
    </div>
  );
};
