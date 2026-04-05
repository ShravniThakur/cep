import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiBookmark } from 'react-icons/hi';
import { toast } from 'react-toastify';
import API from '../api/axios';
import JobCard from '../components/JobCard';
import { PageLoader, EmptyState } from '../components/LoadingStates';

export default function Bookmarks() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get('/users/bookmarks');
        setJobs(data.jobs);
      } catch { toast.error('Failed to load bookmarks'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleBookmarkChange = (jobId, isBookmarked) => {
    if (!isBookmarked) setJobs(prev => prev.filter(j => j._id !== jobId));
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container max-w-5xl animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-3">
          <HiBookmark className="text-primary-600" /> Saved Jobs
        </h1>
        <p className="text-slate-500 text-sm mt-1">{jobs.length} bookmarked job{jobs.length !== 1 ? 's' : ''}</p>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No saved jobs"
          description="Browse jobs and bookmark the ones you like to revisit later"
          action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map(job => (
            <JobCard key={job._id} job={job} bookmarked onBookmarkChange={handleBookmarkChange} />
          ))}
        </div>
      )}
    </div>
  );
}
