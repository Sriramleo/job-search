import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, Archive, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { jobsApi } from '../api';
import { Job, FitLevel, EvidenceStatus, PipelineStage } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { SearchBar } from '../components/common/SearchBar';
import { FilterBar } from '../components/common/FilterBar';
import { JobTable } from '../components/jobs/JobTable';
import { JobPreviewDrawer } from '../components/jobs/JobPreviewDrawer';
import { Pagination } from '../components/ui/Tabs';
import { EmptyState, LoadingSkeleton } from '../components/ui/FeedbackStates';
import { Button } from '../components/ui/Button';

export function getJobTimestamp(job: any): string {
  if (!job) return '';
  const ts = (
    job.discoveredAt ||
    job.discovered_at ||
    job.verifiedAt ||
    job.verified_at ||
    job.postedDate ||
    job.posted_date ||
    job.updatedAt ||
    job.updated_at ||
    job.createdAt ||
    job.created_at ||
    ''
  );
  return String(ts);
}

export interface JobsProps {
  defaultTab?: 'active' | 'archive';
}

export const Jobs: React.FC<JobsProps> = ({ defaultTab = 'active' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'archive' || searchParams.get('status') === 'Archived'
    ? 'archive'
    : defaultTab;
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>(initialTab);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [archiveCount, setArchiveCount] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('city') || 'all');
  const [seniorityFilter, setSeniorityFilter] = useState(searchParams.get('seniority') || 'all');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(Number(searchParams.get('salary')) || 0);
  const [germanFilter, setGermanFilter] = useState(searchParams.get('german') || 'all');
  const [relocationFilter, setRelocationFilter] = useState<string>(searchParams.get('relocation') || 'all');
  const [freshnessFilter, setFreshnessFilter] = useState<string>(searchParams.get('freshness') || 'all');
  const [sortField, setSortField] = useState<string>('latest');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Preview Drawer
  const [selectedPreviewJob, setSelectedPreviewJob] = useState<Job | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Load counts for both tabs
  const loadCounts = async () => {
    try {
      const [activeList, archiveList] = await Promise.all([
        jobsApi.getJobs({ limit: 500 }),
        jobsApi.getJobs({ status: 'Archived' as any, limit: 500 }),
      ]);
      setActiveCount(activeList.length);
      setArchiveCount(archiveList.length);
    } catch {
      // ignore count fetch error
    }
  };

  // Load jobs with filters
  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isArchive = activeTab === 'archive';
      const data = await jobsApi.getJobs({
        search: searchQuery,
        location: locationFilter,
        seniority: seniorityFilter,
        minSalary: minSalaryFilter,
        germanRequirement: germanFilter,
        relocationStatus: relocationFilter as any,
        freshness: freshnessFilter !== 'all' ? freshnessFilter : undefined,
        status: isArchive ? ('Archived' as any) : undefined,
        sortBy: sortField,
        sortDirection: sortDirection,
        limit: 500,
      });

      // Client-side sort fallback ensuring strict newest-first default
      const sorted = [...data].sort((a, b) => {
        if (sortField === 'latest' || sortField === 'discoveredAt' || sortField === 'postedDate') {
          const tsA = getJobTimestamp(a);
          const tsB = getJobTimestamp(b);
          if (tsA && tsB) {
            const cmp = tsB.localeCompare(tsA);
            if (cmp !== 0) return sortDirection === 'asc' ? -cmp : cmp;
          } else if (tsA && !tsB) {
            return sortDirection === 'asc' ? 1 : -1;
          } else if (!tsA && tsB) {
            return sortDirection === 'asc' ? -1 : 1;
          }
          return sortDirection === 'asc'
            ? String(a.id || '').localeCompare(String(b.id || ''))
            : String(b.id || '').localeCompare(String(a.id || ''));
        }
        if (sortField === 'salaryMin') {
          return sortDirection === 'asc' ? (a.salaryMin || 0) - (b.salaryMin || 0) : (b.salaryMin || 0) - (a.salaryMin || 0);
        }
        if (sortField === 'title') {
          return sortDirection === 'asc' ? (a.title || '').localeCompare(b.title || '') : (b.title || '').localeCompare(a.title || '');
        }
        return 0;
      });

      setJobs(sorted);
    } catch (err: any) {
      setError(err?.message || 'Failed to load opportunities from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [activeTab, searchQuery, locationFilter, seniorityFilter, minSalaryFilter, germanFilter, relocationFilter, freshnessFilter, sortField, sortDirection]);

  const handleTabChange = (tab: 'active' | 'archive') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set('tab', tab);
      return updated;
    });
  };

  // Handle saved search chips
  const handleSavedSearch = (name: string) => {
    if (name === 'Berlin High-Fit') {
      setLocationFilter('Berlin');
      setSeniorityFilter('all');
      setMinSalaryFilter(0);
      setGermanFilter('all');
      setRelocationFilter('all');
    } else if (name === 'Munich 90K+') {
      setLocationFilter('Munich');
      setMinSalaryFilter(90000);
      setSeniorityFilter('all');
      setGermanFilter('all');
      setRelocationFilter('all');
    } else if (name === 'Verified Visa') {
      setRelocationFilter('Confirmed by Source');
      setLocationFilter('all');
      setMinSalaryFilter(0);
    } else if (name === 'English Only') {
      setGermanFilter('None');
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setLocationFilter('all');
    setSeniorityFilter('all');
    setMinSalaryFilter(0);
    setGermanFilter('all');
    setRelocationFilter('all');
    setFreshnessFilter('all');
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Paginated slice
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const paginatedJobs = jobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <PageHeader
        title={activeTab === 'active' ? 'Jobs Discovery & Triage' : 'Job Archive & Ineligible Records'}
        subtitle={
          activeTab === 'active'
            ? 'Discover, qualify, and prioritize senior cloud, platform, Kubernetes, and SRE roles in Germany'
            : 'Review applied roles, expired vacancies, and non-German positions kept for audit records'
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                loadJobs();
                loadCounts();
              }}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Feed
            </Button>
          </div>
        }
      />

      {/* Active vs Archive View Toggle */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          onClick={() => handleTabChange('active')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Active Opportunities</span>
          {activeCount !== null && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'active'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabChange('archive')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'archive'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archive & Ineligible</span>
          {archiveCount !== null && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'archive'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {archiveCount}
            </span>
          )}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <SearchBar
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Search across opportunities by title, company, technology (e.g. AWS, Kubernetes, Berlin, Zalando)..."
        />

        <FilterBar
          filters={{
            location: locationFilter,
            seniority: seniorityFilter,
            minSalary: minSalaryFilter,
            germanRequirement: germanFilter,
            relocationStatus: relocationFilter,
          }}
          onFilterChange={(key, val) => {
            if (key === 'location') setLocationFilter(val as string);
            if (key === 'seniority') setSeniorityFilter(val as string);
            if (key === 'minSalary') setMinSalaryFilter(Number(val));
            if (key === 'germanRequirement') setGermanFilter(val as string);
            if (key === 'relocationStatus') setRelocationFilter(val as string);
            setCurrentPage(1);
          }}
          onReset={handleResetFilters}
          onSelectSavedSearch={handleSavedSearch}
        />
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingSkeleton lines={8} />
      ) : error ? (
        <EmptyState
          title="Unable to load opportunities"
          description={error}
          actionText="Retry Loading"
          onAction={loadJobs}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No opportunities found"
          description="Try broadening your salary threshold or location filters to view more qualified German DevOps & Platform roles."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border border-[#E2E8F0] text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#64748B] font-medium">Sort:</span>
                <div className="inline-flex rounded-md shadow-xs bg-white border border-[#E2E8F0] p-0.5">
                  <button
                    onClick={() => handleSort('latest')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      sortField === 'latest'
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Latest {sortField === 'latest' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </button>
                  <button
                    onClick={() => handleSort('salaryMin')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      sortField === 'salaryMin'
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Salary {sortField === 'salaryMin' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </button>
                  <button
                    onClick={() => handleSort('title')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      sortField === 'title'
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Title {sortField === 'title' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </button>
                </div>
              </div>

              {/* Freshness filter pills */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#64748B] font-medium">Freshness:</span>
                <div className="inline-flex rounded-md shadow-xs bg-white border border-[#E2E8F0] p-0.5">
                  <button
                    onClick={() => { setFreshnessFilter('all'); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      freshnessFilter === 'all'
                        ? 'bg-slate-100 text-slate-800 font-semibold border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { setFreshnessFilter('VERIFIED'); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      freshnessFilter === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Verified Active
                  </button>
                  <button
                    onClick={() => { setFreshnessFilter('UNKNOWN'); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      freshnessFilter === 'UNKNOWN'
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Unverified
                  </button>
                </div>
              </div>
            </div>

            <span className="text-slate-500 text-[11px] font-medium whitespace-nowrap">
              {jobs.length} opportunities loaded (Newest-first default)
            </span>
          </div>

          <JobTable
            jobs={paginatedJobs}
            selectedJobId={selectedPreviewJob?.id}
            onSelectJobForPreview={(j) => setSelectedPreviewJob(j)}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={jobs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Job Preview Drawer */}
      <JobPreviewDrawer
        job={selectedPreviewJob}
        isOpen={!!selectedPreviewJob}
        onClose={() => setSelectedPreviewJob(null)}
      />
    </div>
  );
};
