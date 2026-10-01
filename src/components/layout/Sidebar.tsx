import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  Layers,
  FileCode2,
  FileText,
  CalendarCheck2,
  CheckSquare,
  SearchCode,
  BarChart3,
  Mail,
  Settings,
  Cpu,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const navSections = [
    {
      group: 'CORE',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Jobs', path: '/jobs', icon: Briefcase, count: 42 },
        { label: 'Companies', path: '/companies', icon: Building2, count: 10 },
        { label: 'Contacts', path: '/contacts', icon: Users, count: 10 },
      ],
    },
    {
      group: 'EXECUTION',
      items: [
        { label: 'Applications', path: '/applications', icon: Layers, count: 10 },
        { label: 'Application Workspace', path: '/applications/app-zalando-01', icon: FileCode2, badge: 'Active' },
        { label: 'Documents', path: '/documents', icon: FileText },
        { label: 'Interviews', path: '/interviews', icon: CalendarCheck2, count: 3 },
        { label: 'Tasks', path: '/tasks', icon: CheckSquare, count: 15 },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { label: 'Research & Evidence', path: '/research', icon: SearchCode },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
      ],
    },
    {
      group: 'COMMUNICATION',
      items: [
        { label: 'Inbox', path: '/inbox', icon: Mail, count: 4 },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Automation', path: '/automation', icon: Cpu, badge: '5 Jobs' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#E2E8F0] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Branding */}
        <div className="h-16 px-6 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#0F172A] block leading-none">
                Germany Job Hunt
              </span>
              <span className="text-[11px] font-medium text-[#64748B]">
                Recruitment OS · Sriram
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.group}>
              <div className="px-3 mb-1.5 text-[11px] font-semibold text-[#94A3B8] tracking-wider uppercase">
                {section.group}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-blue-50/80 text-[#2563EB] font-semibold'
                              : 'text-[#475569] hover:bg-slate-50 hover:text-[#0F172A]'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  isActive
                                    ? 'text-[#2563EB]'
                                    : 'text-[#64748B] group-hover:text-[#0F172A]'
                                }`}
                              />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.count !== undefined && (
                              <span
                                className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums font-semibold ${
                                  isActive
                                    ? 'bg-blue-100 text-[#2563EB]'
                                    : 'bg-slate-100 text-[#64748B] group-hover:bg-slate-200/80'
                                }`}
                              >
                                {item.count}
                              </span>
                            )}
                            {item.badge && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-semibold uppercase tracking-wider">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Relocation Status Pill in Footer */}
        <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/70">
          <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#0F172A]">Germany Relocation</span>
              <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-emerald-100 text-emerald-800">
                EU Blue Card
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>German Level: A1</span>
              <span>Min: €80K+</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
