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
  Info,
  ExternalLink,
} from 'lucide-react';
import { candidateApi } from '../api';
import { Candidate, AIProviderConfig } from '../types';
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

  // Dynamic AI Provider Configuration (UI state only - no real keys stored)
  const [providers, setProviders] = useState<AIProviderConfig[]>([
    {
      id: 'prov-gemini',
      name: 'Google Gemini',
      providerType: 'gemini',
      selectedModel: 'gemini-1.5-pro',
      availableModels: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
      purpose: 'Tailored CV variant drafting & cover letter synthesis',
      enabled: true,
      temperature: 0.2,
      maxTokens: 4096,
      status: 'Connected',
    },
    {
      id: 'prov-claude',
      name: 'Anthropic Claude',
      providerType: 'claude',
      selectedModel: 'claude-3-5-sonnet',
      availableModels: ['claude-3-5-sonnet', 'claude-3-5-haiku', 'claude-3-opus'],
      purpose: 'Deep role requirement decomposition & evidence validation',
      enabled: true,
      temperature: 0.1,
      maxTokens: 8192,
      status: 'Configured',
    },
    {
      id: 'prov-local',
      name: 'Local Ollama / Open Source',
      providerType: 'local_ollama',
      selectedModel: 'llama-3.3-70b',
      availableModels: ['llama-3.3-70b', 'qwen-2.5-coder-32b', 'deepseek-r1-distill'],
      purpose: 'Local offline privacy inference & resume anonymization',
      enabled: false,
      temperature: 0.3,
      maxTokens: 4096,
      status: 'Standby',
      customEndpoint: 'http://localhost:11434',
    },
    {
      id: 'prov-jev',
      name: 'Jev AI Engine',
      providerType: 'mock_engine',
      selectedModel: 'jev-matching-v2',
      availableModels: ['jev-matching-v2', 'jev-matching-v1-lite'],
      purpose: 'Multi-parameter job matching & compensation alignment',
      enabled: true,
      temperature: 0.0,
      maxTokens: 2048,
      status: 'Connected',
    },
  ]);

  const handleUpdateProvider = (id: string, updates: Partial<AIProviderConfig>) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

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

      {/* 2. Germany Immigration & EU Blue Card Framework */}
      <Card
        header={
          <div className="flex items-center gap-2 font-bold text-xs text-[#0F172A] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Germany Relocation & EU Blue Card Evidentiary Parameters</span>
          </div>
        }
        padding="md"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#64748B] font-medium mb-1">Minimum Target Salary (EUR)</label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] font-bold tabular-nums focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Target personal compensation baseline for German relocation opportunities.
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
          </div>

          {/* Statutory Criteria Evidentiary Checklist */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" /> Statutory EU Blue Card (§ 18g AufenthG) Prerequisites
              </span>
              <span className="text-[10px] text-slate-500">Source: Federal Ministry of the Interior / BAMF</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">1. Recognized University Degree</span>
                  <Badge variant="green" size="sm">Confirmed</Badge>
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Bachelor of Engineering in CS listed with H+ institutional recognition on the Anabin database.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">2. Concrete Employment Offer</span>
                  <Badge variant="amber" size="sm">Per-Opportunity</Badge>
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Requires a signed binding contract or concrete job offer with a German legal entity.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">3. Statutory Salary Threshold</span>
                  <Badge variant="blue" size="sm">Dynamic Baseline</Badge>
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Adjusted annually in the Federal Gazette; verified against current statutory figures at contract signing.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">4. Professional Role Alignment</span>
                  <Badge variant="green" size="sm">Confirmed</Badge>
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Target roles directly align with formal degree and 8 years of verified cloud engineering experience.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-normal pt-1">
              <strong>Evidentiary Notice:</strong> Salary compatibility is evaluated dynamically alongside mandatory degree recognition and binding employment contract conditions. System never generates legal pass/fail verdicts; official visa issuance is determined solely by German consular and immigration authorities.
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Dynamic AI Inference & Scraping Providers */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 font-bold text-xs text-[#0F172A] uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>AI Provider & Model Configuration (Dynamic UI)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-normal">
              Mock/UI configuration only · Zero credentials stored
            </span>
          </div>
        }
        padding="md"
      >
        <div className="space-y-4 text-xs">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`p-4 rounded-xl border transition-all ${
                provider.enabled
                  ? 'bg-slate-50/80 border-slate-200 shadow-2xs'
                  : 'bg-slate-50/30 border-slate-100 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-[#0F172A]">{provider.name}</span>
                  <Badge variant={provider.enabled ? 'green' : 'gray'} size="sm">
                    {provider.enabled ? provider.status : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-500 font-medium cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={provider.enabled}
                      onChange={(e) =>
                        handleUpdateProvider(provider.id, { enabled: e.target.checked })
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span>Active Provider</span>
                  </label>
                </div>
              </div>

              <p className="text-[11px] text-[#64748B] mb-3 leading-normal">
                {provider.purpose}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#64748B] font-medium mb-1">
                    Selected Model
                  </label>
                  <select
                    value={provider.selectedModel}
                    disabled={!provider.enabled}
                    onChange={(e) =>
                      handleUpdateProvider(provider.id, { selectedModel: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
                  >
                    {provider.availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#64748B] font-medium mb-1">
                    Temperature: {provider.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={provider.temperature}
                    disabled={!provider.enabled}
                    onChange={(e) =>
                      handleUpdateProvider(provider.id, {
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-blue-600 disabled:opacity-50 mt-1.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#64748B] font-medium mb-1">
                    API Credential Mask
                  </label>
                  <input
                    type="password"
                    disabled
                    value="••••••••••••••••••••"
                    className="w-full p-2 bg-slate-100/70 border border-[#E2E8F0] rounded-lg text-slate-500 text-xs font-mono"
                    title="Mock credential mask. Never store real secrets."
                  />
                </div>
              </div>
            </div>
          ))}
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
