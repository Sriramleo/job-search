import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, SlidersHorizontal, RefreshCw } from 'lucide-react';
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

export const Jobs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('city') || 'all');
  const [seniorityFilter, setSeniorityFilter] = useState(searchParams.get('seniority') || 'all');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(Number(searchParams.get('salary')) || 0);
  const [germanFilter, setGermanFilter] = useState(searchParams.get('german') || 'all');
  const [relocationFilter, setRelocationFilter] = useState<string>(searchParams.get('relocation') || 'all');
  const [sortField, setSortField] = useState<string>('salaryMin');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Preview Drawer
  const [selectedPreviewJob, setSelectedPreviewJob] = useState<Job | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Load jobs with filters
  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const data = await jobsApi.getJobs({
        search: searchQuery,
        location: locationFilter,
        seniority: seniorityFilter,
        minSalary: minSalaryFilter,
        germanRequirement: germanFilter,
        relocationStatus: relocationFilter as any,
      });

      // Sort
      const sorted = [...data].sort((a, b) => {
        if (sortField === 'salaryMin') {
          return sortDirection === 'asc' ? a.salaryMin - b.salaryMin : b.salaryMin - a.salaryMin;
        }
        if (sortField === 'title') {
          return sortDirection === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        }
        return 0;
      });

      setJobs(sorted);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [searchQuery, locationFilter, seniorityFilter, minSalaryFilter, germanFilter, relocationFilter, sortField, sortDirection]);

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
        title="Jobs Discovery & Triage"
        subtitle="Discover, qualify, and prioritize senior cloud, platform, Kubernetes, and SRE roles in Germany"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadJobs}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Feed
            </Button>
          </div>
        }
      />

      {/* Search and Filters */}
      <div className="space-y-3">
        <SearchBar
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Search across 42 jobs by title, company, technology (e.g. AWS, Kubernetes, Berlin, Zalando)..."
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
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No opportunities found"
          description="Try broadening your salary threshold or location filters to view more qualified German DevOps & Platform roles."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
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
