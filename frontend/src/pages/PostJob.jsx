import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiPlus, HiX, HiSave } from 'react-icons/hi';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { PageLoader, Spinner } from '../components/LoadingStates';

const JOB_TYPES  = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid'];
const EXPERIENCE = ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'];

const DEFAULT_FORM = {
  title: '', description: '', company: '', location: '', jobType: 'Full-time',
  experience: 'Entry', education: '',
  salary: { min: '', max: '', currency: 'USD', period: 'yearly' },
  skills: [], responsibilities: [], requirements: [], benefits: [],
  deadline: '',
};

export default function PostJob() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;

  const [form, setForm]     = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);

  const [skillInput, setSkillInput]  = useState('');
  const [respInput, setRespInput]    = useState('');
  const [reqInput, setReqInput]      = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await API.get(`/jobs/${id}`);
        const j = data.job;
        setForm({
          title: j.title, description: j.description, company: j.company,
          location: j.location, jobType: j.jobType, experience: j.experience,
          education: j.education || '',
          salary: j.salary || DEFAULT_FORM.salary,
          skills: j.skills || [], responsibilities: j.responsibilities || [],
          requirements: j.requirements || [], benefits: j.benefits || [],
          deadline: j.deadline ? j.deadline.split('T')[0] : '',
        });
      } catch { toast.error('Failed to load job'); navigate('/dashboard'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));
  const setSalary = (field, value) => setForm(p => ({ ...p, salary: { ...p.salary, [field]: value } }));

  const addToList = (field, value, clearFn) => {
    const v = value.trim();
    if (v && !form[field].includes(v)) {
      set(field, [...form[field], v]);
      clearFn('');
    }
  };

  const removeFromList = (field, idx) => set(field, form[field].filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.company || !form.location) {
      return toast.error('Please fill all required fields');
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        salary: JSON.stringify(form.salary),
        skills: JSON.stringify(form.skills),
        responsibilities: JSON.stringify(form.responsibilities),
        requirements: JSON.stringify(form.requirements),
        benefits: JSON.stringify(form.benefits),
      };

      if (isEdit) {
        await API.put(`/jobs/${id}`, payload);
        toast.success('Job updated successfully!');
      } else {
        await API.post('/jobs', payload);
        toast.success('Job posted successfully! 🎉');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title">{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
        <p className="text-slate-500 text-sm mt-1">{isEdit ? 'Update the job details below' : 'Fill in the details to attract the best candidates'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-7 space-y-5">
          <h2 className="font-display font-semibold text-slate-800 text-lg">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Job Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} required
                placeholder="e.g. Senior Frontend Engineer" className="input" />
            </div>
            <div>
              <label className="label">Company Name *</label>
              <input value={form.company} onChange={e => set('company', e.target.value)} required
                placeholder="e.g. Acme Corp" className="input" />
            </div>
            <div>
              <label className="label">Location *</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} required
                placeholder="e.g. New York, NY or Remote" className="input" />
            </div>
            <div>
              <label className="label">Job Type</label>
              <select value={form.jobType} onChange={e => set('jobType', e.target.value)} className="input">
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Experience Level</label>
              <select value={form.experience} onChange={e => set('experience', e.target.value)} className="input">
                {EXPERIENCE.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Education Required</label>
              <input value={form.education} onChange={e => set('education', e.target.value)}
                placeholder="e.g. Bachelor's in Computer Science" className="input" />
            </div>
            <div>
              <label className="label">Application Deadline</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Job Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} required
              rows={6} placeholder="Describe the role, what the team does, and what makes this opportunity exciting…"
              className="input resize-none" />
          </div>
        </div>

        {/* Salary */}
        <div className="card p-7 space-y-4">
          <h2 className="font-display font-semibold text-slate-800 text-lg">Compensation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Min Salary</label>
              <input type="number" value={form.salary.min} onChange={e => setSalary('min', e.target.value)}
                placeholder="50000" className="input" />
            </div>
            <div>
              <label className="label">Max Salary</label>
              <input type="number" value={form.salary.max} onChange={e => setSalary('max', e.target.value)}
                placeholder="100000" className="input" />
            </div>
            <div>
              <label className="label">Currency</label>
              <select value={form.salary.currency} onChange={e => setSalary('currency', e.target.value)} className="input">
                {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Period</label>
              <select value={form.salary.period} onChange={e => setSalary('period', e.target.value)} className="input">
                {['yearly', 'monthly', 'hourly'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card p-7 space-y-4">
          <h2 className="font-display font-semibold text-slate-800 text-lg">Required Skills</h2>
          <div className="flex flex-wrap gap-2 min-h-10">
            {form.skills.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold border border-primary-100">
                {s}
                <button type="button" onClick={() => removeFromList('skills', i)} className="hover:text-red-500"><HiX className="text-xs" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('skills', skillInput, setSkillInput))}
              placeholder="Type a skill and press Enter" className="input flex-1" />
            <button type="button" onClick={() => addToList('skills', skillInput, setSkillInput)} className="btn-secondary px-4"><HiPlus /></button>
          </div>
        </div>

        {/* Lists */}
        {[
          { field: 'responsibilities', label: 'Responsibilities', input: respInput, setInput: setRespInput, placeholder: 'e.g. Lead architecture decisions' },
          { field: 'requirements',     label: 'Requirements',     input: reqInput,  setInput: setReqInput,  placeholder: 'e.g. 3+ years of React experience' },
          { field: 'benefits',         label: 'Benefits',         input: benefitInput, setInput: setBenefitInput, placeholder: 'e.g. Unlimited PTO' },
        ].map(({ field, label, input, setInput, placeholder }) => (
          <div key={field} className="card p-7 space-y-4">
            <h2 className="font-display font-semibold text-slate-800 text-lg">{label}</h2>
            <ul className="space-y-2">
              {form[field].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 p-3 bg-slate-50 rounded-xl">
                  <span className="mt-0.5 text-primary-500">•</span>
                  <span className="flex-1">{item}</span>
                  <button type="button" onClick={() => removeFromList(field, i)} className="text-slate-400 hover:text-red-500 flex-shrink-0"><HiX /></button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList(field, input, setInput))}
                placeholder={placeholder} className="input flex-1" />
              <button type="button" onClick={() => addToList(field, input, setInput)} className="btn-secondary px-4"><HiPlus /></button>
            </div>
          </div>
        ))}

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-2">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary px-8">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary px-8">
            {saving ? <Spinner size="sm" color="white" /> : <HiSave />}
            {saving ? 'Saving…' : isEdit ? 'Update Job' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
