import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Briefcase, Users, ExternalLink, ChevronRight } from 'lucide-react';
import { companiesApi } from '../api';
import { Company } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { SearchBar } from '../components/common/SearchBar';
import { EvidenceBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton, EmptyState } from '../components/ui/FeedbackStates';

export const Companies: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companiesApi.getCompanies(searchQuery);
        setCompanies(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, [searchQuery]);

  const filteredCompanies = companies.filter((c) => {
    if (industryFilter !== 'all' && c.industry !== industryFilter) return false;
    return true;
  });

  if (isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Target Companies"
        subtitle="German technology employers evaluated for engineering scale, international hiring policies, and relocation support"
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search companies by name, industry, tech stack, or city..."
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-[#64748B] font-medium">Industry:</span>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="py-1.5 px-3 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Industries</option>
            <option value="E-Commerce & Fashion Tech">E-Commerce & Fashion</option>
            <option value="FinTech & Digital Banking">FinTech & Banking</option>
            <option value="Quick Commerce & Delivery">Quick Commerce</option>
            <option value="HR SaaS & Enterprise Software">HR SaaS & Enterprise</option>
            <option value="Process Mining & Enterprise AI">Process Mining & AI</option>
          </select>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <th className="py-3 px-4 w-[24%]">Company & Industry</th>
              <th className="py-3 px-4 w-[16%]">Germany Hubs</th>
              <th className="py-3 px-4 w-[12%] text-center">Open Jobs</th>
              <th className="py-3 px-4 w-[18%]">International Hiring</th>
              <th className="py-3 px-4 w-[18%]">Relocation Support</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCompanies.map((comp) => (
              <tr
                key={comp.id}
                onClick={() => navigate(`/companies/${comp.id}`)}
                className="hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {comp.name}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">{comp.industry}</div>
                </td>
                <td className="py-3.5 px-4 text-[#475569]">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{comp.germanyLocations.join(', ')}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="font-bold text-xs bg-slate-100 px-2 py-0.5 rounded-full text-[#0F172A] tabular-nums">
                    {comp.openRolesCount} roles
                  </span>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <EvidenceBadge status={comp.internationalHiringEvidence} />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <EvidenceBadge status={comp.relocationEvidence} />
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/companies/${comp.id}`);
                    }}
                  >
                    <span>Intelligence</span>
                    <ChevronRight className="w-3 h-3 -mr-1" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
