import React from 'react';
import { Link } from 'react-router-dom';
import { HiLocationMarker, HiClock, HiCurrencyDollar, HiBookmark, HiOutlineBookmark } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-toastify';

const JOB_TYPE_COLORS = {
  'Full-time':  'badge-blue',
  'Part-time':  'badge-yellow',
  'Contract':   'badge-purple',
  'Internship': 'badge-green',
  'Remote':     'badge-green',
  'Hybrid':     'badge-gray',
};

const EXP_COLORS = {
  'Entry':     'badge-green',
  'Junior':    'badge-blue',
  'Mid':       'badge-blue',
  'Senior':    'badge-purple',
  'Lead':      'badge-purple',
  'Executive': 'badge-red',
};

export default function JobCard({ job, bookmarked = false, onBookmarkChange }) {
  const { isLoggedIn, isJobseeker } = useAuth();

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn || !isJobseeker) {
      toast.info('Please login as a job seeker to bookmark jobs');
      return;
    }
    try {
      const { data } = await API.put(`/users/bookmark/${job._id}`);
      toast.success(data.message);
      if (onBookmarkChange) onBookmarkChange(job._id, data.bookmarked);
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const salaryText = job.salary?.min && job.salary?.max
    ? `$${(job.salary.min / 1000).toFixed(0)}k–$${(job.salary.max / 1000).toFixed(0)}k`
    : null;

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <Link to={`/jobs/${job._id}`} className="card-hover p-6 flex flex-col gap-4 animate-fade-in group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg flex-shrink-0 overflow-hidden">
            {job.companyLogo
              ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
              : job.company?.charAt(0).toUpperCase()
            }
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-slate-900 text-base truncate group-hover:text-primary-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-slate-500 truncate">{job.company}</p>
          </div>
        </div>
        <button onClick={handleBookmark} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-primary-600 transition-colors flex-shrink-0">
          {bookmarked ? <HiBookmark className="text-primary-600 text-lg" /> : <HiOutlineBookmark className="text-lg" />}
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className={JOB_TYPE_COLORS[job.jobType] || 'badge-gray'}>{job.jobType}</span>
        <span className={EXP_COLORS[job.experience]   || 'badge-gray'}>{job.experience}</span>
        {!job.isActive && <span className="badge-red">Closed</span>}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <span className="flex items-center gap-1"><HiLocationMarker className="text-slate-400" />{job.location}</span>
        {salaryText && <span className="flex items-center gap-1"><HiCurrencyDollar className="text-slate-400" />{salaryText}/{job.salary.period}</span>}
        <span className="flex items-center gap-1"><HiClock className="text-slate-400" />{timeAgo(job.createdAt)}</span>
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map(skill => (
            <span key={skill} className="px-2.5 py-1 bg-slate-50 rounded-lg text-xs font-medium text-slate-600 border border-slate-100">
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="px-2.5 py-1 bg-slate-50 rounded-lg text-xs font-medium text-slate-500">
              +{job.skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <span className="text-xs text-slate-400">{job.applicationsCount || 0} applicants</span>
        <span className="text-xs font-semibold text-primary-600 group-hover:underline">View Details →</span>
      </div>
    </Link>
  );
}
