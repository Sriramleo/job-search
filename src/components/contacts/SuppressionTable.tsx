import React, { useState } from 'react';
import { ShieldAlert, Trash2, Plus, Ban, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/FeedbackStates';
import { SuppressionRecord } from '../../types';

interface SuppressionTableProps {
  items: SuppressionRecord[];
  onAdd: (targetType: 'email' | 'domain', targetValue: string, reason?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const SuppressionTable: React.FC<SuppressionTableProps> = ({
  items,
  onAdd,
  onDelete,
}) => {
  const [targetType, setTargetType] = useState<'email' | 'domain'>('domain');
  const [targetValue, setTargetValue] = useState('');
  const [reason, setReason] = useState('User opt-out / corporate policy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetValue.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd(targetType, targetValue.trim(), reason.trim());
      setTargetValue('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="p-3.5 bg-red-50/70 border border-red-200/80 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
        <Ban className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Compliance & Opt-Out Gate</span>
          <p className="mt-0.5 text-red-800">
            Contacts or companies on this suppression list are permanently blocked from receiving outreach drafts. 
            All recruiter research and drafting engines query this list prior to candidate contact generation.
          </p>
        </div>
      </div>

      {/* Add Suppression Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Do-Not-Contact Rule
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Target Type</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            >
              <option value="domain">Company Domain (e.g. spammydomain.de)</option>
              <option value="email">Specific Email (e.g. recruiter@company.com)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1">Target Value</label>
            <input
              type="text"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={targetType === 'domain' ? 'company.com' : 'name@company.com'}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Explicit opt-out or corporate do-not-contact"
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || !targetValue.trim()}>
            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
            Add to Suppression List
          </Button>
        </div>
      </form>

      {/* Suppression List Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {items.length === 0 ? (
          <EmptyState
            title="Suppression list is clean"
            description="No contacts or domains have been added to the do-not-contact suppression list."
          />
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <th className="py-3 px-4 w-[25%]">Target Value</th>
                <th className="py-3 px-4 w-[20%]">Rule Type</th>
                <th className="py-3 px-4 w-[35%]">Reason</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {item.targetValue}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={item.targetType === 'domain' ? 'blue' : 'gray'}>
                      {item.targetType.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate">{item.reason}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
