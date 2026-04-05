import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiSearch, HiLocationMarker, HiBriefcase, HiUsers,
  HiTrendingUp, HiLightningBolt, HiCheckCircle, HiArrowRight,
} from 'react-icons/hi';
import API from '../api/axios';
import JobCard from '../components/JobCard';
import { SkeletonCard } from '../components/LoadingStates';

const CATEGORIES = [
  { label: 'Engineering',   icon: '⚙️', query: 'engineer' },
  { label: 'Design',        icon: '🎨', query: 'design' },
  { label: 'Marketing',     icon: '📈', query: 'marketing' },
  { label: 'Finance',       icon: '💰', query: 'finance' },
  { label: 'Healthcare',    icon: '🏥', query: 'healthcare' },
  { label: 'Data Science',  icon: '📊', query: 'data science' },
  { label: 'Product',       icon: '🚀', query: 'product manager' },
  { label: 'Sales',         icon: '🤝', query: 'sales' },
];

const STATS = [
  { icon: <HiBriefcase />, value: '12,000+', label: 'Active Jobs',     color: 'from-blue-500 to-blue-600' },
  { icon: <HiUsers />,     value: '50,000+', label: 'Registered Users', color: 'from-emerald-500 to-emerald-600' },
  { icon: <HiTrendingUp />,value: '3,200+',  label: 'Companies',        color: 'from-violet-500 to-violet-600' },
  { icon: <HiCheckCircle />,value: '98%',    label: 'Success Rate',     color: 'from-amber-500 to-amber-600' },
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [location, setLocation] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await API.get('/jobs?limit=6&sort=-createdAt');
        setFeatured(data.jobs);
      } catch {}
      finally { setLoading(false); }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search)   params.set('search', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white pt-16 pb-24">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-sm font-semibold mb-6">
            <HiLightningBolt className="text-primary-500" />
            Over 1,200 new jobs this week
          </div>

          <h1 className="font-display font-bold text-5xl md:text-6xl text-slate-900 leading-tight mb-6">
            Find Your{' '}
            <span className="text-gradient">Dream Job</span>
            <br />Without the Hustle
          </h1>

          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            TalentBridge connects world-class talent with exceptional companies.
            Search smarter, apply faster, and land the role you deserve.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-2 shadow-card-hover border border-slate-100 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3">
              <HiSearch className="text-slate-400 text-lg flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Job title, skills, or company"
                className="flex-1 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-3 border-l border-slate-100">
              <HiLocationMarker className="text-slate-400 text-lg flex-shrink-0" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City or Remote"
                className="flex-1 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent w-32"
              />
            </div>
            <button type="submit" className="btn-primary whitespace-nowrap">
              <HiSearch /> Search Jobs
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-400">Popular: <span className="text-slate-600">React Developer, Product Manager, UI Designer, Data Analyst</span></p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ icon, value, label, color }) => (
              <div key={label} className="text-center">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl mx-auto mb-3`}>
                  {icon}
                </div>
                <p className="font-display font-bold text-2xl text-slate-900">{value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by Category ── */}
      <section className="page-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-primary-600 mb-1">Explore</p>
            <h2 className="section-title">Browse by Category</h2>
          </div>
          <Link to="/jobs" className="btn-ghost text-sm hidden sm:flex">View all <HiArrowRight /></Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(({ label, icon, query }) => (
            <button
              key={label}
              onClick={() => navigate(`/jobs?search=${query}`)}
              className="card-hover p-4 text-center flex flex-col items-center gap-2"
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-xs font-semibold text-slate-700">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Jobs ── */}
      <section className="page-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-primary-600 mb-1">Latest</p>
            <h2 className="section-title">Featured Jobs</h2>
          </div>
          <Link to="/jobs" className="btn-ghost text-sm hidden sm:flex">View all <HiArrowRight /></Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featured.map(job => <JobCard key={job._id} job={job} />)
          }
        </div>

        <div className="text-center mt-10">
          <Link to="/jobs" className="btn-primary text-base px-8 py-3">
            Explore All Jobs <HiArrowRight />
          </Link>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary-600 to-blue-700 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Are You a Recruiter?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Post your job in minutes and reach thousands of qualified candidates. No hidden fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=recruiter" className="px-8 py-3.5 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
                Post a Job — Free
              </Link>
              <Link to="/jobs" className="px-8 py-3.5 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors">
                Browse Talent
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
