import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiLocationMarker, HiBriefcase, HiCurrencyDollar, HiClock, HiUsers,
  HiCheckCircle, HiBookmark, HiOutlineBookmark, HiArrowLeft, HiX,
  HiAcademicCap, HiEye, HiLightningBolt,
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/LoadingStates';

const STATUS_STYLES = {
  pending:     'badge-yellow',
  reviewed:    'badge-blue',
  shortlisted: 'badge-purple',
  accepted:    'badge-green',
  rejected:    'badge-red',
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, isJobseeker, user } = useAuth();

  const [job, setJob]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [applied, setApplied]   = useState(false);
  const [appStatus, setAppStatus] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [applying, setApplying]     = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile]   = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await API.get(`/jobs/${id}`);
        setJob(data.job);

        if (isLoggedIn && isJobseeker) {
          try {
            const appRes = await API.get('/applications/my-applications');
            const myApp  = appRes.data.applications.find(a => a.job?._id === id || a.job === id);
            if (myApp) { setApplied(true); setAppStatus(myApp.status); }
          } catch {}

          try {
            const bRes = await API.get('/users/bookmarks');
            setBookmarked(bRes.data.jobs.some(j => j._id === id || j === id));
          } catch {}
        }
      } catch {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, isLoggedIn, isJobseeker]);

  const handleApply = async () => {
    if (!isLoggedIn) { toast.info('Please log in to apply'); navigate('/login'); return; }
    if (!isJobseeker) { toast.error('Only job seekers can apply'); return; }
    setShowModal(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const form = new FormData();
      form.append('coverLetter', coverLetter);
      if (resumeFile) form.append('resume', resumeFile);

      await API.post(`/applications/apply/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setApplied(true);
      setAppStatus('pending');
      setShowModal(false);
      toast.success('Application submitted successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn || !isJobseeker) { toast.info('Login as job seeker to bookmark'); return; }
    try {
      const { data } = await API.put(`/users/bookmark/${id}`);
      setBookmarked(data.bookmarked);
      toast.success(data.message);
    } catch { toast.error('Failed to update bookmark'); }
  };

  if (loading) return <PageLoader />;
  if (!job) return null;

  const timeAgo = (date) => {
    const days = Math.floor((Date.now() - new Date(date)) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7)  return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  };

  return (
    <div className="page-container max-w-6xl animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <HiArrowLeft /> Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job header card */}
          <div className="card p-7">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl font-bold text-slate-600 flex-shrink-0 overflow-hidden shadow-sm">
                {job.companyLogo
                  ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                  : job.company?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display font-bold text-2xl text-slate-900 mb-1">{job.title}</h1>
                <p className="text-slate-600 font-medium">{job.company}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="badge-blue">{job.jobType}</span>
                  <span className="badge-gray">{job.experience}</span>
                  {!job.isActive && <span className="badge-red">Closed</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              {[
                { icon: <HiLocationMarker />, label: 'Location', val: job.location },
                { icon: <HiCurrencyDollar />, label: 'Salary', val: job.salary?.min ? `$${(job.salary.min/1000).toFixed(0)}k–$${(job.salary.max/1000).toFixed(0)}k` : 'Negotiable' },
                { icon: <HiUsers />, label: 'Applicants', val: job.applicationsCount || 0 },
                { icon: <HiClock />, label: 'Posted', val: timeAgo(job.createdAt) },
              ].map(({ icon, label, val }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-sm mb-0.5">
                    {icon} {label}
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-7">
            <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Job Description</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">{job.description}</p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities?.length > 0 && (
            <div className="card p-7">
              <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <HiCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0 text-base" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="card p-7">
              <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Requirements</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <HiLightningBolt className="text-primary-500 mt-0.5 flex-shrink-0 text-base" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits?.length > 0 && (
            <div className="card p-7">
              <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Benefits</h2>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((b, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100">
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="card p-7">
              <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold border border-primary-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: sticky apply card ── */}
        <div className="space-y-5">
          <div className="card p-6 lg:sticky lg:top-24">
            {applied ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <HiCheckCircle className="text-emerald-500 text-3xl" />
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-1">Applied!</h3>
                <p className="text-sm text-slate-500 mb-4">Your application has been submitted</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className={STATUS_STYLES[appStatus] || 'badge-gray'}>{appStatus}</span>
                </div>
                <Link to="/applied-jobs" className="btn-secondary w-full justify-center mt-4 text-sm">
                  View My Applications
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={handleApply}
                  disabled={!job.isActive}
                  className="btn-primary w-full justify-center py-3.5 text-base"
                >
                  {job.isActive ? 'Apply Now' : 'Applications Closed'}
                </button>
                <button onClick={handleBookmark} className="btn-secondary w-full justify-center mt-3">
                  {bookmarked ? <><HiBookmark className="text-primary-600" /> Saved</> : <><HiOutlineBookmark /> Save Job</>}
                </button>
              </>
            )}

            <div className="divider" />

            <div className="space-y-3 text-sm">
              {job.education && (
                <div className="flex items-center gap-2 text-slate-600">
                  <HiAcademicCap className="text-slate-400" />
                  <span>{job.education}</span>
                </div>
              )}
              {job.deadline && (
                <div className="flex items-center gap-2 text-slate-600">
                  <HiClock className="text-slate-400" />
                  <span>Apply by {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-500">
                <HiEye className="text-slate-400" />
                <span>{job.views || 0} views</span>
              </div>
            </div>
          </div>

          {/* Posted by */}
          {job.postedBy && (
            <div className="card p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Posted By</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-blue-100 flex items-center justify-center font-bold text-primary-700">
                  {job.postedBy.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{job.postedBy.name}</p>
                  <p className="text-xs text-slate-500">Recruiter</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">Apply for this Role</h3>
                <p className="text-sm text-slate-500 mt-0.5">{job.title} at {job.company}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                <HiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={submitApplication} className="p-6 space-y-5">
              <div>
                <label className="label">Cover Letter</label>
                <textarea
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  rows={6}
                  placeholder="Tell the recruiter why you're a great fit for this role…"
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="label">Resume / CV <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => setResumeFile(e.target.files[0])}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-slate-200 rounded-xl cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">PDF, DOC or DOCX · Max 5MB</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={applying} className="btn-primary flex-1 justify-center">
                  {applying ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
