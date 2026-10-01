import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  CheckSquare,
  Menu,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { mockCandidate } from '../../mocks/candidate';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Dynamic Page Title
  const getPageTitle = (pathname: string): { title: string; subtitle?: string } => {
    if (pathname === '/dashboard') return { title: 'Executive Dashboard', subtitle: 'Targeted overview & next priority actions' };
    if (pathname.startsWith('/jobs/') && pathname !== '/jobs') return { title: 'Job Fit Evaluation', subtitle: 'Detailed technical match & evidence ledger' };
    if (pathname === '/jobs') return { title: 'Jobs Triage', subtitle: 'Discover and qualify Senior/Lead opportunities in Germany' };
    if (pathname.startsWith('/applications/')) return { title: 'Application Workspace', subtitle: 'High-focus workstation for material drafting & verification' };
    if (pathname === '/applications') return { title: 'Applications Pipeline', subtitle: 'Track and advance candidate submissions' };
    if (pathname.startsWith('/companies/') && pathname !== '/companies') return { title: 'Company Research Intelligence', subtitle: 'Engineering culture, signals & relocation facts' };
    if (pathname === '/companies') return { title: 'Target Companies', subtitle: 'German technology employers hiring internationally' };
    if (pathname === '/contacts') return { title: 'Network & Contacts', subtitle: 'Recruiters, hiring managers & CNCF referral paths' };
    if (pathname === '/documents') return { title: 'Documents & Resumes', subtitle: 'Master CV, tailored variants & verified Q&A' };
    if (pathname === '/interviews') return { title: 'Interviews & Debriefs', subtitle: 'System architecture, pairing & recruiter screens' };
    if (pathname === '/tasks') return { title: 'Action Tasks', subtitle: 'Execution queue grouped by immediacy' };
    if (pathname === '/research') return { title: 'Research & Evidence', subtitle: 'Zero-hallucination immigration & sponsorship ledger' };
    if (pathname === '/inbox') return { title: 'Recruitment Inbox', subtitle: 'Direct communications from German employers' };
    if (pathname === '/analytics') return { title: 'Recruitment Analytics', subtitle: 'Funnel progression, salary bands & telemetry' };
    if (pathname === '/settings') return { title: 'System Settings', subtitle: 'Candidate parameters, Blue Card thresholds & integrations' };
    if (pathname === '/automation') return { title: 'Automation Control', subtitle: 'Scheduled job discovery, matching & preparation agents' };
    return { title: 'Germany Job Hunt' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile burger + Dynamic Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-[#0F172A] leading-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && <p className="text-[11px] text-[#64748B] hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs, companies, skills (e.g. Zalando, AWS, Berlin)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
          />
        </form>
      </div>

      {/* Right: Quick actions + User Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Tasks popover trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTaskDropdown(!showTaskDropdown);
              setShowNotifDropdown(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
            title="Tasks due today"
            aria-label="Tasks"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>

          {showTaskDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-semibold text-[#0F172A]">
                <span>Immediate Tasks (Today)</span>
                <span className="text-[11px] font-normal text-blue-600 cursor-pointer" onClick={() => { setShowTaskDropdown(false); navigate('/tasks'); }}>View All</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-md">
                  <span className="font-medium text-amber-900 block">Zalando Lead Platform</span>
                  <span className="text-[11px] text-amber-700">Review and approve application materials</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-md">
                  <span className="font-medium text-slate-800 block">Delivery Hero Screen</span>
                  <span className="text-[11px] text-slate-600">Send thank-you email following initial call</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowTaskDropdown(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-white" />
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-semibold text-[#0F172A]">
                <span>Recent Updates</span>
                <span className="text-[10px] text-slate-400">Phase 1 Live</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 bg-blue-50/50 border border-blue-100 rounded-md">
                  <span className="font-medium text-blue-900 block">Interview Invitation Received</span>
                  <span className="text-[11px] text-blue-700">Delivery Hero invited you to Technical Pairing.</span>
                </div>
                <div className="p-2 bg-purple-50/50 border border-purple-100 rounded-md">
                  <span className="font-medium text-purple-900 block">New Job Qualified</span>
                  <span className="text-[11px] text-purple-700">Lead Platform Engineer at Zalando (Strong Fit).</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* User Profile */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shadow-2xs">
            SS
          </div>
          <div className="hidden sm:block text-left">
            <span className="font-semibold text-xs text-[#0F172A] block leading-tight">
              {mockCandidate.name}
            </span>
            <span className="text-[11px] text-[#64748B] block leading-tight font-medium">
              {/* STRICT RULE: Candidate current title is Senior DevOps Engineer */}
              {mockCandidate.currentRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
