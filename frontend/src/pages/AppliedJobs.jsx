import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiClipboardList, HiBriefcase, HiLocationMarker, HiClock,
  HiX, HiCheckCircle, HiEye, HiDocumentText,
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { PageLoader, EmptyState } from '../components/LoadingStates';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     cls: 'badge-yellow', icon: <HiClock /> },
  reviewed:    { label: 'Reviewed',    cls: 'badge-blue',   icon: <HiEye /> },
  shortlisted: { label: 'Shortlisted', cls: 'badge-purple', icon: <HiCheckCircle /> },
  accepted:    { label: 'Accepted',    cls: 'badge-green',  icon: <HiCheckCircle /> },
  rejected:    { label: 'Rejected',    cls: 'badge-red',    icon: <HiX /> },
};

export default function AppliedJobs() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get('/applications/my-applications');
        setApplications(data.applications);
      } catch { toast.error('Failed to load applications'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await API.delete(`/applications/${id}`);
      setApplications(prev => prev.filter(a => a._id !== id));
      toast.success('Application withdrawn');
    } catch { toast.error('Failed to withdraw'); }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <PageLoader />;

  return (
    <div className="page-container max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-3"><HiClipboardList className="text-primary-600" /> My Applications</h1>
        <p className="text-slate-500 text-sm mt-1">{applications.length} total applications</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[['all', 'All', applications.length, 'bg-slate-100 text-slate-700'], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label, counts[k] || 0, ''])].map(([key, label, count]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`card px-4 py-3 text-center transition-all ${filter === key ? 'border-primary-400 bg-primary-50' : 'hover:border-slate-300'}`}>
            <p className="font-display font-bold text-xl text-slate-900">{count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<HiClipboardList />}
          title="No applications yet"
          description="Start browsing and apply to jobs you're interested in"
          action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(app => {
            const job    = app.job || {};
            const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const timeAgo = (date) => {
              const d = Math.floor((Date.now() - new Date(date)) / 86400000);
              if (d === 0) return 'Today'; if (d === 1) return 'Yesterday'; if (d < 7) return `${d}d ago`;
              return `${Math.floor(d / 7)}w ago`;
            };

            return (
              <div key={app._id} className="card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg flex-shrink-0">
                  {job.company?.charAt(0) || '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-display font-semibold text-slate-900">
                        {job.isActive !== false
                          ? <Link to={`/jobs/${job._id}`} className="hover:text-primary-600 transition-colors">{job.title}</Link>
                          : job.title
                        }
                      </h3>
                      <p className="text-sm text-slate-500">{job.company}</p>
                    </div>
                    <span className={`${status.cls} flex items-center gap-1.5`}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><HiLocationMarker />{job.location}</span>
                    <span className="flex items-center gap-1"><HiBriefcase />{job.jobType}</span>
                    <span className="flex items-center gap-1"><HiClock />Applied {timeAgo(app.appliedAt)}</span>
                    {!job.isActive && <span className="text-red-500 font-medium">· Job Closed</span>}
                  </div>

                  {app.recruiterNotes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Recruiter Note:</p>
                      <p className="text-xs text-blue-600">{app.recruiterNotes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {app.resume?.url && (
                    <a href={app.resume.url} target="_blank" rel="noopener noreferrer"
                      className="btn-ghost p-2.5 rounded-xl" title="View Resume">
                      <HiDocumentText className="text-slate-500 text-lg" />
                    </a>
                  )}
                  {app.status === 'pending' && (
                    <button onClick={() => handleWithdraw(app._id)}
                      className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Withdraw">
                      <HiX className="text-lg" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
