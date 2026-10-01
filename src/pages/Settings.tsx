import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Cpu,
  Mail,
  Sliders,
  Check,
  Save,
} from 'lucide-react';
import { candidateApi } from '../api';
import { Candidate } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/FeedbackStates';

export const Settings: React.FC = () => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [minSalary, setMinSalary] = useState(80000);
  const [germanLevel, setGermanLevel] = useState('A1');
  const [isLoading, setIsLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const data = await candidateApi.getCandidate();
        setCandidate(data);
        setMinSalary(data.targetMinimumSalary);
        setGermanLevel(data.germanLevel);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidate();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;
    await candidateApi.updateCandidate({
      targetMinimumSalary: minSalary,
      germanLevel: germanLevel,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (isLoading || !candidate) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
      <PageHeader
        title="Settings & Candidate Profile"
        subtitle="Manage your profile parameters, Germany Blue Card immigration objectives, AI connectors, and Gmail synchronization"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Configuration
            </Button>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
        }
      />

      {/* 1. Candidate Profile */}
      <Card
        header={
          <div className="flex items-center gap-2 font-bold text-xs text-[#0F172A] uppercase tracking-wider">
            <User className="w-4 h-4 text-blue-600" />
            <span>Candidate Profile (Baseline)</span>
          </div>
        }
        padding="md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#64748B] font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={candidate.name}
              disabled
              className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A] font-semibold"
            />
          </div>

          <div>
            <label className="block text-[#64748B] font-medium mb-1">Current Job Title</label>
            {/* STRICT RULE: Current title is Senior DevOps Engineer */}
            <input
              type="text"
              value={candidate.currentRole}
              disabled
              className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A] font-semibold"
            />
          </div>

          <div>
            <label className="block text-[#64748B] font-medium mb-1">Years of Experience</label>
            <input
              type="text"
              value={`${candidate.experienceYears} Years`}
              disabled
              className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] font-medium mb-1">Formal Education</label>
            <input
              type="text"
              value={candidate.education}
              disabled
              className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[#64748B] font-medium mb-1">Target Roles</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
              {candidate.targetRoles.map((r) => (
                <span key={r} className="px-2 py-0.5 rounded bg-white text-slate-800 text-xs font-medium border border-slate-200">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Germany Immigration & EU Blue Card */}
      <Card
        header={
          <div className="flex items-center gap-2 font-bold text-xs text-[#0F172A] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Germany Relocation & EU Blue Card Parameters</span>
          </div>
        }
        padding="md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#64748B] font-medium mb-1">Minimum Target Salary (EUR)</label>
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] font-bold tabular-nums focus:outline-none focus:border-blue-500"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Shortage occupation threshold in Germany: €41,041 (Your target €80K+ easily satisfies law)
            </span>
          </div>

          <div>
            <label className="block text-[#64748B] font-medium mb-1">German Language Proficiency</label>
            <select
              value={germanLevel}
              onChange={(e) => setGermanLevel(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500"
            >
              <option value="A1">A1 (Currently learning / beginner)</option>
              <option value="A2">A2 (Elementary)</option>
              <option value="B1">B1 (Intermediate)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#64748B] font-medium mb-1">Relocation Origin</label>
            <input
              type="text"
              value="India (Chennai)"
              disabled
              className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] font-medium mb-1">Target Country</label>
            <input
              type="text"
              value="Germany (Berlin, Munich, Frankfurt, Hamburg, Cologne)"
              disabled
              className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A]"
            />
          </div>
        </div>
      </Card>

      {/* 3. AI Providers & Integrations */}
      <Card
        header={
          <div className="flex items-center gap-2 font-bold text-xs text-[#0F172A] uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>AI Inference & Scraping Providers</span>
          </div>
        }
        padding="md"
      >
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="font-bold text-[#0F172A] block">Jev AI Engine</span>
              <span className="text-[11px] text-[#64748B]">Used for multi-parameter job matching and fit reasoning</span>
            </div>
            <Badge variant="green">Connected</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="font-bold text-[#0F172A] block">Google Gemini (Gemini 1.5 Pro)</span>
              <span className="text-[11px] text-[#64748B]">Tailored CV variant drafting & cover letter synthesis</span>
            </div>
            <Badge variant="green">Connected</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="font-bold text-[#0F172A] block">Apify Crawler Fleet</span>
              <span className="text-[11px] text-[#64748B]">Automated scraping of StepStone.de and company career portals</span>
            </div>
            <Badge variant="green">Connected</Badge>
          </div>
        </div>
      </Card>

      {/* 4. Gmail Synchronization */}
      <Card
        header={
          <div className="flex items-center gap-2 font-bold text-xs text-[#0F172A] uppercase tracking-wider">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Gmail Integration (Recruiter Mailbox)</span>
          </div>
        }
        padding="md"
      >
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#0F172A] block">sriramsugavanams@gmail.com</span>
            <span className="text-[11px] text-[#64748B]">Google OAuth 2.0 Connected · Scans for interview invites and ATS receipts</span>
          </div>
          <Badge variant="green">OAuth Verified</Badge>
        </div>
      </Card>
    </form>
  );
};
