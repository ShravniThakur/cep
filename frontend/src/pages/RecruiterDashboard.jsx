import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  HiBriefcase, HiUsers, HiEye, HiTrendingUp, HiPlusCircle,
  HiPencil, HiTrash, HiChevronDown, HiChevronUp, HiCheckCircle, HiX, HiClock,
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { PageLoader, EmptyState, Spinner } from '../components/LoadingStates';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, Filler);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_OPTS = [
  { val: 'pending',     label: 'Pending',     cls: 'text-amber-700  bg-amber-50  border-amber-200' },
  { val: 'reviewed',    label: 'Reviewed',    cls: 'text-blue-700   bg-blue-50   border-blue-200' },
  { val: 'shortlisted', label: 'Shortlisted', cls: 'text-purple-700 bg-purple-50 border-purple-200' },
  { val: 'accepted',    label: 'Accepted',    cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { val: 'rejected',    label: 'Rejected',    cls: 'text-red-700    bg-red-50    border-red-200' },
];

export default function RecruiterDashboard() {
  const navigate  = useNavigate();
  const [analytics, setAnalytics]     = useState(null);
  const [jobs, setJobs]               = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [analyticsRes, jobsRes] = await Promise.all([
          API.get('/applications/analytics'),
          API.get('/jobs/my-jobs'),
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setJobs(jobsRes.data.jobs);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    })();
  }, []);

  const loadApplicants = async (jobId) => {
    if (expandedJob === jobId) { setExpandedJob(null); return; }
    setExpandedJob(jobId);
    setAppsLoading(true);
    try {
      const { data } = await API.get(`/applications/job/${jobId}`);
      setApplicants(prev => ({ ...prev, [jobId]: data.applications }));
    } catch { toast.error('Failed to load applicants'); }
    finally { setAppsLoading(false); }
  };

  const updateStatus = async (appId, jobId, status) => {
    try {
      await API.put(`/applications/${appId}/status`, { status });
      setApplicants(prev => ({
        ...prev,
        [jobId]: prev[jobId].map(a => a._id === appId ? { ...a, status } : a),
      }));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      toast.success('Job deleted');
    } catch { toast.error('Failed to delete job'); }
  };

  const toggleJobStatus = async (job) => {
    try {
      const { data } = await API.put(`/jobs/${job._id}`, { isActive: !job.isActive });
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, isActive: data.job.isActive } : j));
      toast.success(`Job ${data.job.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update job'); }
  };

  if (loading) return <PageLoader />;

  const a = analytics || {};

  /* ── Chart data ── */
  const appsPerJobData = {
    labels: (a.appsPerJob || []).slice(0,8).map(j => j.jobTitle.length > 20 ? j.jobTitle.slice(0,20)+'…' : j.jobTitle),
    datasets: [{
      label: 'Applications',
      data: (a.appsPerJob || []).slice(0,8).map(j => j.count),
      backgroundColor: 'rgba(46, 135, 255, 0.8)',
      borderRadius: 8,
    }],
  };

  const statusDoughnutData = {
    labels: ['Pending', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected'],
    datasets: [{
      data: [
        a.statusBreakdown?.pending    || 0,
        a.statusBreakdown?.reviewed   || 0,
        a.statusBreakdown?.shortlisted|| 0,
        a.statusBreakdown?.accepted   || 0,
        a.statusBreakdown?.rejected   || 0,
      ],
      backgroundColor: ['#f59e0b','#3b82f6','#8b5cf6','#22c55e','#ef4444'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const monthlyData = {
    labels: (a.monthlyData || []).map(d => MONTH_NAMES[d._id.month - 1]),
    datasets: [{
      label: 'Applications',
      data: (a.monthlyData || []).map(d => d.count),
      fill: true,
      borderColor: '#2e87ff',
      backgroundColor: 'rgba(46,135,255,0.08)',
      tension: 0.4,
      pointBackgroundColor: '#2e87ff',
      pointRadius: 4,
    }],
  };

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="section-title">Recruiter Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor your jobs and applications</p>
        </div>
        <Link to="/post-job" className="btn-primary"><HiPlusCircle /> Post a Job</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '📋', label: 'Total Jobs',        val: a.totalJobs         || 0, color: 'from-blue-500 to-blue-600' },
          { icon: '✅', label: 'Active Jobs',       val: a.activeJobs        || 0, color: 'from-emerald-500 to-emerald-600' },
          { icon: '👥', label: 'Total Applications',val: a.totalApplications || 0, color: 'from-violet-500 to-violet-600' },
          { icon: '👁️', label: 'Total Views',       val: a.totalViews        || 0, color: 'from-amber-500 to-amber-600' },
        ].map(({ icon, label, val, color }) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon bg-gradient-to-br ${color} text-white`}>{icon}</div>
            <div>
              <p className="font-display font-bold text-2xl text-slate-900">{val.toLocaleString()}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Applications per Job</h3>
          <div className="h-56">
            {(a.appsPerJob || []).length > 0
              ? <Bar data={appsPerJobData} options={chartOpts} />
              : <EmptyState icon="📊" title="No data yet" description="Post jobs to see analytics" />
            }
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Application Status</h3>
          <div className="h-56 flex items-center justify-center">
            {a.totalApplications > 0
              ? <Doughnut data={statusDoughnutData} options={{ ...chartOpts, plugins: { legend: { display: true, position: 'bottom' } } }} />
              : <EmptyState icon="🍩" title="No applications" description="Applications will appear here" />
            }
          </div>
        </div>

        <div className="card p-6 lg:col-span-3">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Monthly Applications (Last 6 Months)</h3>
          <div className="h-48">
            {(a.monthlyData || []).length > 0
              ? <Line data={monthlyData} options={{ ...chartOpts, scales: { y: { beginAtZero: true } } }} />
              : <EmptyState icon="📈" title="No monthly data" description="Data will appear as applications come in" />
            }
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-display font-semibold text-slate-800 text-lg">My Posted Jobs</h2>
          <span className="badge-blue">{jobs.length} jobs</span>
        </div>

        {jobs.length === 0 ? (
          <EmptyState icon="📋" title="No jobs posted yet"
            description="Post your first job to start receiving applications"
            action={<Link to="/post-job" className="btn-primary"><HiPlusCircle /> Post a Job</Link>}
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {jobs.map(job => (
              <div key={job._id}>
                {/* Job row */}
                <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 text-sm">{job.title}</h3>
                      <span className={`badge text-xs ${job.isActive ? 'badge-green' : 'badge-red'}`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.company} · {job.location} · {job.applicationsCount || 0} applicants · {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => loadApplicants(job._id)}
                      className={`btn-ghost text-xs px-3 py-2 ${expandedJob === job._id ? 'bg-primary-50 text-primary-700' : ''}`}>
                      <HiUsers /> Applicants
                      {expandedJob === job._id ? <HiChevronUp /> : <HiChevronDown />}
                    </button>
                    <button onClick={() => toggleJobStatus(job)} className="btn-ghost p-2" title={job.isActive ? 'Deactivate' : 'Activate'}>
                      {job.isActive ? <HiX className="text-red-400" /> : <HiCheckCircle className="text-emerald-500" />}
                    </button>
                    <Link to={`/edit-job/${job._id}`} className="btn-ghost p-2" title="Edit">
                      <HiPencil className="text-slate-500" />
                    </Link>
                    <button onClick={() => deleteJob(job._id)} className="btn-ghost p-2" title="Delete">
                      <HiTrash className="text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Applicants panel */}
                {expandedJob === job._id && (
                  <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
                    {appsLoading ? (
                      <div className="flex items-center gap-3 py-4 justify-center"><Spinner size="sm" /> Loading applicants…</div>
                    ) : (applicants[job._id] || []).length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No applications yet for this job</p>
                    ) : (
                      <div className="space-y-3">
                        {(applicants[job._id] || []).map(app => (
                          <div key={app._id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-blue-100 flex items-center justify-center font-bold text-primary-700 text-sm flex-shrink-0">
                              {app.applicant?.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 text-sm">{app.applicant?.name}</p>
                              <p className="text-xs text-slate-500">{app.applicant?.email}</p>
                              {app.coverLetter && (
                                <p className="text-xs text-slate-500 mt-1 truncate max-w-md">{app.coverLetter}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {app.resume?.url && (
                                <a href={app.resume.url} target="_blank" rel="noopener noreferrer"
                                  className="text-xs btn-secondary px-3 py-1.5">Resume</a>
                              )}
                              <select
                                value={app.status}
                                onChange={e => updateStatus(app._id, job._id, e.target.value)}
                                className={`text-xs font-semibold border rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer ${
                                  STATUS_OPTS.find(s => s.val === app.status)?.cls || ''
                                }`}
                              >
                                {STATUS_OPTS.map(({ val, label }) => (
                                  <option key={val} value={val}>{label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
