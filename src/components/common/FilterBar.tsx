import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  filters: {
    location?: string;
    seniority?: string;
    workModel?: string;
    germanRequirement?: string;
    relocationStatus?: string;
    minSalary?: number;
    technicalFit?: string;
  };
  onFilterChange: (key: string, value: string | number) => void;
  onReset: () => void;
  onSelectSavedSearch?: (searchName: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onSelectSavedSearch,
}) => {
  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== '' && v !== 'all' && v !== 0
  );

  return (
    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
      {/* Saved search chips */}
      {onSelectSavedSearch && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#64748B] font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Saved Searches:
          </span>
          <button
            onClick={() => onSelectSavedSearch('Berlin High-Fit')}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[#475569] font-medium transition-colors shrink-0"
          >
            Berlin · Strong Fit
          </button>
          <button
            onClick={() => onSelectSavedSearch('Munich 90K+')}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[#475569] font-medium transition-colors shrink-0"
          >
            Munich · €90K+
          </button>
          <button
            onClick={() => onSelectSavedSearch('Verified Visa')}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[#475569] font-medium transition-colors shrink-0"
          >
            Confirmed Relocation
          </button>
          <button
            onClick={() => onSelectSavedSearch('English Only')}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-[#475569] font-medium transition-colors shrink-0"
          >
            English Only (No German Req)
          </button>
        </div>
      )}

      {/* Primary dropdown controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
        {/* Location */}
        <div>
          <label className="block text-[11px] font-medium text-[#64748B] mb-1">Location</label>
          <select
            value={filters.location || 'all'}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Locations</option>
            <option value="Berlin">Berlin</option>
            <option value="Munich">Munich</option>
            <option value="Frankfurt">Frankfurt</option>
            <option value="Hamburg">Hamburg</option>
            <option value="Cologne">Cologne</option>
          </select>
        </div>

        {/* Seniority */}
        <div>
          <label className="block text-[11px] font-medium text-[#64748B] mb-1">Seniority</label>
          <select
            value={filters.seniority || 'all'}
            onChange={(e) => onFilterChange('seniority', e.target.value)}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Levels</option>
            <option value="Lead">Lead</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        {/* Minimum Salary */}
        <div>
          <label className="block text-[11px] font-medium text-[#64748B] mb-1">Min Salary</label>
          <select
            value={filters.minSalary || 0}
            onChange={(e) => onFilterChange('minSalary', Number(e.target.value))}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value={0}>Any (€80K+)</option>
            <option value={85000}>€85,000+</option>
            <option value={90000}>€90,000+</option>
            <option value={95000}>€95,000+</option>
            <option value={100000}>€100,000+</option>
          </select>
        </div>

        {/* German Requirement */}
        <div>
          <label className="block text-[11px] font-medium text-[#64748B] mb-1">German Language</label>
          <select
            value={filters.germanRequirement || 'all'}
            onChange={(e) => onFilterChange('germanRequirement', e.target.value)}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Requirements</option>
            <option value="None">None (English Only)</option>
            <option value="A1/A2 Preferred">A1/A2 Preferred</option>
          </select>
        </div>

        {/* Relocation Evidence */}
        <div>
          <label className="block text-[11px] font-medium text-[#64748B] mb-1">Relocation Evidence</label>
          <select
            value={filters.relocationStatus || 'all'}
            onChange={(e) => onFilterChange('relocationStatus', e.target.value)}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Evidence</option>
            <option value="Confirmed by Source">Confirmed by Source</option>
            <option value="Evidence Found">Evidence Found</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="w-full text-xs text-[#64748B]"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
