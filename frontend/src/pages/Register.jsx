import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser, HiBriefcase, HiEye, HiEyeOff, HiOfficeBuilding } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/LoadingStates';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') || 'jobseeker',
  });
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');

    const result = await register(form.name, form.email, form.password, form.role);
    if (result.success) {
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-primary-50/30">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <HiBriefcase className="text-white text-2xl" />
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Create account</h1>
          <p className="text-slate-500 mt-2 text-sm">Join thousands of professionals on TalentBridge</p>
        </div>

        <div className="card p-8">
          {/* Role Toggle */}
          <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50 mb-6">
            {[{ val: 'jobseeker', label: '🔍 Job Seeker' }, { val: 'recruiter', label: '🏢 Recruiter' }].map(({ val, label }) => (
              <button
                key={val} type="button"
                onClick={() => setForm(p => ({ ...p, role: val }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${form.role === val ? 'bg-white text-primary-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="name" type="text" required value={form.name} onChange={handleChange}
                  placeholder="John Doe" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="password" type={showPw ? 'text' : 'password'} required
                  value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
                  className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="confirmPassword" type="password" required
                  value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password"
                  className="input pl-10" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <><Spinner size="sm" color="white" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          By creating an account, you agree to our <a href="#" className="hover:text-slate-600">Terms of Service</a> and <a href="#" className="hover:text-slate-600">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
