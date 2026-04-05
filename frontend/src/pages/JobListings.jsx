import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HiSearch, HiLocationMarker, HiFilter, HiX, HiChevronLeft, HiChevronRight, HiAdjustments,
} from 'react-icons/hi';
import API from '../api/axios';
import JobCard from '../components/JobCard';
import { SkeletonCard, EmptyState } from '../components/LoadingStates';

const JOB_TYPES   = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid'];
const EXPERIENCE  = ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'];
const SALARY_RANGES = [
  { label: 'Any', min: '', max: '' },
  { label: '$0–$50k',   min: 0,     max: 50000 },
  { label: '$50–$100k', min: 50000, max: 100000 },
  { label: '$100–$150k',min: 100000,max: 150000 },
  { label: '$150k+',    min: 150000,max: '' },
];

export default function JobListings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search:    searchParams.get('search')   || '',
    location:  searchParams.get('location') || '',
    jobType:   searchParams.get('jobType')  || '',
    experience:searchParams.get('experience')|| '',
    salaryMin: searchParams.get('salaryMin')|| '',
    salaryMax: searchParams.get('salaryMax')|| '',
  });

  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [meta, setMeta]       = useState({ total: 0, pages: 1 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookmarks, setBookmarks]     = useState({});

  const fetchJobs = useCallback(async (currentPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('page', currentPage);
      params.set('limit', 12);

      const { data } = await API.get(`/jobs?${params.toString()}`);
      setJobs(data.jobs);
      setMeta({ total: data.total, pages: data.pages });
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(1);
    fetchJobs(1);
  }, [filters]);

  useEffect(() => {
    fetchJobs(page);
  }, [page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', location: '', jobType: '', experience: '', salaryMin: '', salaryMax: '' });
    setSearchParams({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  const handleBookmarkChange = (jobId, isBookmarked) => {
    setBookmarks(prev => ({ ...prev, [jobId]: isBookmarked }));
  };

  const handleSearch = (e) => { e.preventDefault(); fetchJobs(1); };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-2">Browse Jobs</h1>
        <p className="text-slate-500 text-sm">
          {meta.total > 0 ? `${meta.total.toLocaleString()} positions available` : 'Search for opportunities'}
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            placeholder="Job title, skills, or company…"
            className="input pl-10"
          />
        </div>
        <div className="relative sm:w-52">
          <HiLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            value={filters.location}
            onChange={e => setFilters(p => ({ ...p, location: e.target.value }))}
            placeholder="Location…"
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary whitespace-nowrap"><HiSearch /> Search</button>
        <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-secondary sm:hidden relative">
          <HiAdjustments />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      <div className="flex gap-6">
        {/* Sidebar filters — desktop always visible, mobile toggle */}
        <aside className={`
          w-64 flex-shrink-0
          ${sidebarOpen ? 'block' : 'hidden'} sm:block
          fixed sm:static inset-0 sm:inset-auto z-40 sm:z-auto
          bg-white sm:bg-transparent p-4 sm:p-0 overflow-y-auto sm:overflow-visible
        `}>
          {/* Mobile overlay */}
          <div className="sm:hidden fixed inset-0 bg-black/20 -z-10" onClick={() => setSidebarOpen(false)} />

          <div className="card p-5 space-y-6 sm:sticky sm:top-20">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-slate-800 flex items-center gap-2">
                <HiFilter /> Filters
                {activeFilterCount > 0 && (
                  <span className="badge-blue">{activeFilterCount}</span>
                )}
              </h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                  <HiX /> Clear all
                </button>
              )}
            </div>

            {/* Job Type */}
            <FilterSection title="Job Type">
              {JOB_TYPES.map(type => (
                <FilterChip key={type} label={type}
                  active={filters.jobType === type}
                  onClick={() => handleFilterChange('jobType', type)} />
              ))}
            </FilterSection>

            {/* Experience */}
            <FilterSection title="Experience Level">
              {EXPERIENCE.map(exp => (
                <FilterChip key={exp} label={exp}
                  active={filters.experience === exp}
                  onClick={() => handleFilterChange('experience', exp)} />
              ))}
            </FilterSection>

            {/* Salary */}
            <FilterSection title="Salary Range">
              {SALARY_RANGES.map(({ label, min, max }) => (
                <FilterChip key={label} label={label}
                  active={filters.salaryMin === String(min) && filters.salaryMax === String(max)}
                  onClick={() => {
                    setFilters(p => ({ ...p, salaryMin: String(min), salaryMax: String(max) }));
                  }}
                />
              ))}
            </FilterSection>

            <button onClick={() => setSidebarOpen(false)} className="btn-primary w-full justify-center sm:hidden">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(filters).map(([key, val]) => val ? (
                <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-100">
                  {val}
                  <button onClick={() => setFilters(p => ({ ...p, [key]: '' }))} className="hover:text-primary-900">
                    <HiX />
                  </button>
                </span>
              ) : null)}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No jobs found"
              description="Try adjusting your filters or search terms"
              action={<button onClick={clearFilters} className="btn-primary">Clear all filters</button>}
            />
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-4">{meta.total} results · Page {page} of {meta.pages}</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {jobs.map(job => (
                  <JobCard key={job._id} job={job}
                    bookmarked={!!bookmarks[job._id]}
                    onBookmarkChange={handleBookmarkChange}
                  />
                ))}
              </div>

              {/* Pagination */}
              {meta.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn-secondary px-3 py-2 disabled:opacity-40">
                    <HiChevronLeft />
                  </button>
                  {Array.from({ length: Math.min(7, meta.pages) }, (_, i) => {
                    let pageNum;
                    if (meta.pages <= 7) pageNum = i + 1;
                    else if (page <= 4) pageNum = i + 1;
                    else if (page >= meta.pages - 3) pageNum = meta.pages - 6 + i;
                    else pageNum = page - 3 + i;
                    return (
                      <button key={pageNum} onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                          page === pageNum
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600'
                        }`}>
                        {pageNum}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(meta.pages, p + 1))} disabled={page === meta.pages}
                    className="btn-secondary px-3 py-2 disabled:opacity-40">
                    <HiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const FilterSection = ({ title, children }) => (
  <div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">{title}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
      active
        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600'
    }`}>
    {label}
  </button>
);
