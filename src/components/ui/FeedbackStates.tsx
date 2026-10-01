import React from 'react';
import { AlertCircle, FolderSearch, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-[#E2E8F0]">
      <div className="p-3 bg-slate-100 rounded-full text-slate-500 mb-4">
        {icon || <FolderSearch className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
      <p className="text-xs text-[#64748B] max-w-sm mt-1.5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export interface LoadingSkeletonProps {
  lines?: number;
  type?: 'table' | 'card' | 'text';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 4,
  type = 'table',
}) => {
  if (type === 'card') {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-100 rounded w-2/3" />
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-slate-100 rounded" />
          <div className="h-3 bg-slate-100 rounded w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden divide-y divide-slate-100 animate-pulse">
      <div className="h-10 bg-slate-100 px-6" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-1/6" />
          <div className="h-4 bg-slate-100 rounded w-1/6" />
          <div className="h-6 bg-slate-100 rounded w-20" />
        </div>
      ))}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this section. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-rose-50/50 rounded-xl border border-rose-200">
      <AlertCircle className="w-10 h-10 text-rose-600 mb-3" />
      <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3>
      <p className="text-xs text-rose-700/80 max-w-sm mt-1">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
