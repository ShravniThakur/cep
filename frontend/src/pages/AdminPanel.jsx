import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  HiShieldCheck, HiUsers, HiBriefcase, HiClipboardList,
  HiTrash, HiCheckCircle, HiX, HiSearch, HiRefresh,
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { PageLoader, EmptyState, Spinner } from '../components/LoadingStates';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const TABS = [
  { id: 'overview', label: 'Overview',  icon: <HiShieldCheck /> },
  { id: 'users',    label: 'Users',     icon: <HiUsers /> },
  { id: 'jobs',     label: 'Jobs',      icon: <HiBriefcase /> },
];

export default function AdminPanel() {
  const [tab, setTab]         = useState('overview');
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [jobSearch, setJobSearch]   = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        API.get('/users/stats'),
        API.get('/users'),
        API.get('/jobs?limit=50&sort=-createdAt'),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setJobs(jobsRes.data.jobs);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all associated data?`)) return;
    setActionLoading(id);
    try {
      await API.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
    finally { setActionLoading(null); }
  };

  const toggleUser = async (id) => {
    setActionLoading(id);
    try {
      const { data } = await API.put(`/users/${id}/toggle-status`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.user.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Failed to update user'); }
    finally { setActionLoading(null); }
  };

  const deleteJob = async (id, title) => {
    if (!window.confirm(`Delete job "${title}"?`)) return;
    setActionLoading(id);
    try {
      await API.delete(`/jobs/${id}`);
      setJobs(prev => prev.filter(j => j._id !== id));
      toast.success('Job deleted');
    } catch { toast.error('Failed to delete job'); }
    finally { setActionLoading(null); }
  };

  const toggleJob = async (job) => {
    setActionLoading(job._id);
    try {
      const { data } = await API.put(`/jobs/${job._id}`, { isActive: !job.isActive });
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, isActive: data.job.isActive } : j));
      toast.success(`Job ${data.job.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update job'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <PageLoader />;

  const s = stats || {};

  const regChartData = {
    labels: (s.monthlyRegistrations || []).map(d => MONTH_NAMES[d._id.month - 1]),
    datasets: [{
      label: 'Registrations',
      data: (s.monthlyRegistrations || []).map(d => d.count),
      backgroundColor: 'rgba(46,135,255,0.8)',
      borderRadius: 8,
    }],
  };

  const userDistData = {
    labels: ['Job Seekers', 'Recruiters'],
    datasets: [{
      data: [s.totalJobSeekers || 0, s.totalRecruiters || 0],
      backgroundColor: ['#2e87ff', '#10b981'],
      borderWidth: 0,
    }],
  };

  const filteredUsers = users.filter(u => {
    const matchRole   = !roleFilter || u.role === roleFilter;
    const matchSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  const filteredJobs = jobs.filter(j => !jobSearch || j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.company.toLowerCase().includes(jobSearch.toLowerCase()));

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <HiShieldCheck className="text-primary-600" /> Admin Panel
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage the entire platform</p>
        </div>
        <button onClick={loadData} className="btn-secondary text-sm"><HiRefresh /> Refresh</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-8 w-fit">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '👥', label: 'Total Users',        val: s.totalUsers        || 0, color: 'from-blue-500 to-blue-600' },
              { icon: '🔍', label: 'Job Seekers',        val: s.totalJobSeekers   || 0, color: 'from-sky-500 to-sky-600' },
              { icon: '🏢', label: 'Recruiters',         val: s.totalRecruiters   || 0, color: 'from-indigo-500 to-indigo-600' },
              { icon: '📋', label: 'Total Jobs',         val: s.totalJobs         || 0, color: 'from-violet-500 to-violet-600' },
              { icon: '✅', label: 'Active Jobs',        val: s.activeJobs        || 0, color: 'from-emerald-500 to-emerald-600' },
              { icon: '📨', label: 'Total Applications', val: s.totalApplications || 0, color: 'from-amber-500 to-amber-600' },
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-display font-semibold text-slate-800 mb-4">Monthly Registrations</h3>
              <div className="h-56">
                {(s.monthlyRegistrations || []).length > 0
                  ? <Bar data={regChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  : <EmptyState icon="📊" title="No data" description="User registrations will appear here" />
                }
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-800 mb-4">User Distribution</h3>
              <div className="h-56 flex items-center justify-center">
                <Doughnut data={userDistData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          </div>

          {/* Recent users */}
          <div className="card">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-display font-semibold text-slate-800">Recent Users</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {(s.recentUsers || []).map(u => (
                <div key={u._id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-blue-100 flex items-center justify-center font-bold text-primary-700 text-sm">
                    {u.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className={`badge text-xs capitalize ${u.role === 'recruiter' ? 'badge-blue' : 'badge-green'}`}>{u.role}</span>
                  <span className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name or email…" className="input pl-10" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input sm:w-40">
              <option value="">All Roles</option>
              <option value="jobseeker">Job Seeker</option>
              <option value="recruiter">Recruiter</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">{filteredUsers.length} users</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-blue-100 flex items-center justify-center font-bold text-primary-700 text-xs">
                            {u.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`badge capitalize ${u.role === 'recruiter' ? 'badge-blue' : u.role === 'admin' ? 'badge-purple' : 'badge-green'}`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        {u.role !== 'admin' && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleUser(u._id)} disabled={actionLoading === u._id}
                              className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-red-400 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                              title={u.isActive ? 'Deactivate' : 'Activate'}>
                              {actionLoading === u._id ? <Spinner size="sm" /> : u.isActive ? <HiX /> : <HiCheckCircle />}
                            </button>
                            <button onClick={() => deleteUser(u._id, u.name)} disabled={actionLoading === u._id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                              <HiTrash />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <EmptyState icon={<HiUsers />} title="No users found" description="Try adjusting your search filters" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── JOBS TAB ── */}
      {tab === 'jobs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={jobSearch} onChange={e => setJobSearch(e.target.value)}
              placeholder="Search jobs by title or company…" className="input pl-10" />
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-600">{filteredJobs.length} jobs</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Job Title', 'Company', 'Type', 'Applicants', 'Status', 'Posted', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredJobs.map(job => (
                    <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800 max-w-xs truncate">{job.title}</td>
                      <td className="px-5 py-3.5 text-slate-500">{job.company}</td>
                      <td className="px-5 py-3.5"><span className="badge-blue">{job.jobType}</span></td>
                      <td className="px-5 py-3.5 text-slate-600 font-semibold">{job.applicationsCount || 0}</td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${job.isActive ? 'badge-green' : 'badge-red'}`}>{job.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleJob(job)} disabled={actionLoading === job._id}
                            className={`p-1.5 rounded-lg transition-colors ${job.isActive ? 'text-red-400 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                            title={job.isActive ? 'Deactivate' : 'Activate'}>
                            {actionLoading === job._id ? <Spinner size="sm" /> : job.isActive ? <HiX /> : <HiCheckCircle />}
                          </button>
                          <button onClick={() => deleteJob(job._id, job.title)} disabled={actionLoading === job._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <HiTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredJobs.length === 0 && (
                <EmptyState icon={<HiBriefcase />} title="No jobs found" description="Try adjusting your search" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
