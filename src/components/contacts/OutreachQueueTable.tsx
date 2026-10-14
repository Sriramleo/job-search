import React from 'react';
import {
  Mail,
  Globe,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldAlert,
  Building,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/FeedbackStates';
import { OutreachQueueItem } from '../../types';

interface OutreachQueueTableProps {
  items: OutreachQueueItem[];
  onSelect: (item: OutreachQueueItem) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const OutreachQueueTable: React.FC<OutreachQueueTableProps> = ({
  items,
  onSelect,
  onApprove,
  onReject,
}) => {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No outreach drafts in queue"
        description="When relevant German recruiters or hiring managers are researched for active DevOps roles, tailored outreach drafts will appear here for review."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
            <th className="py-3 px-4 w-[24%]">Recruiter / Contact</th>
            <th className="py-3 px-4 w-[24%]">Target Company & Role</th>
            <th className="py-3 px-4 w-[16%]">Channel & Evidence</th>
            <th className="py-3 px-4 w-[14%]">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => onSelect(item)}
              className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
            >
              <td className="py-3 px-4">
                <div className="font-semibold text-slate-800">{item.contactName}</div>
                <div className="text-slate-500 text-[11px]">{item.contactRole}</div>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {item.companyName}
                </div>
                <div className="text-slate-500 text-[11px] truncate">{item.targetJobTitle}</div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  {item.channel === 'Email' ? (
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>{item.channel}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {item.evidence.confidence} confidence
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge
                  variant={
                    item.status === 'Approved'
                      ? 'green'
                      : item.status === 'Suppressed'
                      ? 'red'
                      : 'blue'
                  }
                >
                  {item.status}
                </Badge>
              </td>
              <td
                className="py-3 px-4 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(item)}
                    className="h-7 text-xs px-2"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Review
                  </Button>
                  {item.status !== 'Approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApprove(item.id)}
                      className="h-7 text-xs px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </Button>
                  )}
                  {item.status !== 'Opted Out' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReject(item.id)}
                      className="h-7 text-xs px-2 text-slate-400 hover:text-slate-600"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
