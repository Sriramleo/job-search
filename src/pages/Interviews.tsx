import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Code,
  Layers,
  HelpCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { interviewsApi } from '../api';
import { Interview } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton, EmptyState } from '../components/ui/FeedbackStates';

export const Interviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await interviewsApi.getInterviews();
        setInterviews(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const filteredInterviews = interviews.filter((i) => {
    if (activeTab === 'upcoming' && i.status !== 'Scheduled') return false;
    if (activeTab === 'completed' && i.status !== 'Completed') return false;
    return true;
  });

  if (isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews & Debriefs"
        subtitle="Manage upcoming technical rounds, system architecture deep dives, and recruiter screenings"
      />

      <Tabs
        variant="pills"
        tabs={[
          { id: 'upcoming', label: 'Upcoming Scheduled', count: interviews.filter((i) => i.status === 'Scheduled').length },
          { id: 'completed', label: 'Completed & Debriefs', count: interviews.filter((i) => i.status === 'Completed').length },
          { id: 'all', label: 'All Interviews', count: interviews.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {filteredInterviews.length === 0 ? (
        <EmptyState
          title="No data available"
          description="No interviews scheduled in this view."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredInterviews.map((int) => (
            <Card
              key={int.id}
              padding="md"
              className="hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3" onClick={() => setSelectedInterview(int)}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {int.companyName}
                  </span>
                  <Badge variant={int.status === 'Scheduled' ? 'blue' : 'green'}>
                    {int.status}
                  </Badge>
                </div>

                <div>
                  <span className="font-semibold text-xs text-slate-800 block">{int.round}</span>
                  <span className="text-[11px] text-[#64748B] block mt-0.5">{int.jobTitle}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(int.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{int.durationMinutes} mins</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-semibold text-[#64748B] block">Interviewers:</span>
                  <span className="text-[#0F172A] font-medium">{int.interviewerName} ({int.interviewerRole})</span>
                </div>

                {int.technicalTopics.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-[#64748B] block mb-1">Topics:</span>
                    <div className="flex flex-wrap gap-1">
                      {int.technicalTopics.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" /> {int.interviewType}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setSelectedInterview(int)}>
                  Open Prep Notes
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Interview Prep Detail Modal */}
      {selectedInterview && (
        <Modal
          isOpen={!!selectedInterview}
          onClose={() => setSelectedInterview(null)}
          title={`${selectedInterview.companyName} — ${selectedInterview.round}`}
          size="lg"
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedInterview(null)}>
              Done
            </Button>
          }
        >
          <div className="space-y-4 text-xs max-h-[65vh] overflow-y-auto pr-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-semibold text-slate-900">{selectedInterview.jobTitle}</div>
              <div className="text-slate-600">
                Scheduled for {new Date(selectedInterview.scheduledDate).toLocaleString()} · {selectedInterview.durationMinutes} Minutes
              </div>
              <div className="text-slate-700">Interviewers: {selectedInterview.interviewerName}</div>
            </div>

            {selectedInterview.systemDesignTopics.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] block">
                  System Architecture Topics
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {selectedInterview.systemDesignTopics.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] block">
                Technical Focus & Drill Down
              </span>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                {selectedInterview.technicalTopics.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>

            {selectedInterview.keyQuestionsPrepared.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] block">
                  Key Questions to Ask Interviewer
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {selectedInterview.keyQuestionsPrepared.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] block">
                Preparation Notes & Strategy
              </span>
              <p className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-950 leading-relaxed font-sans">
                {selectedInterview.preparationNotes}
              </p>
            </div>

            {selectedInterview.feedback && (
              <div className="space-y-1.5">
                <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] block">
                  Round Feedback
                </span>
                <p className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-950 leading-relaxed">
                  {selectedInterview.feedback}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
