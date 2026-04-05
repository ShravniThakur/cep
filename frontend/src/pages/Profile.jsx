import React, { useState, useEffect } from 'react';
import {
  HiUser, HiMail, HiPhone, HiLocationMarker, HiGlobe, HiPencil,
  HiPlus, HiTrash, HiSave, HiX, HiDocumentText, HiCamera,
  HiLink, HiAcademicCap, HiBriefcase,
} from 'react-icons/hi';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PageLoader, Spinner } from '../components/LoadingStates';

export default function Profile() {
  const { user, isJobseeker, isRecruiter, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get('/profile/me');
        setProfile(data.profile);
        setForm({
          headline: data.profile.headline || '',
          bio: data.profile.bio || '',
          phone: data.profile.phone || '',
          location: data.profile.location || '',
          website: data.profile.website || '',
          linkedin: data.profile.linkedin || '',
          github: data.profile.github || '',
          skills: data.profile.skills || [],
          experience: data.profile.experience || [],
          education: data.profile.education || [],
          companyName: data.profile.companyName || '',
          companyWebsite: data.profile.companyWebsite || '',
          companyDescription: data.profile.companyDescription || '',
          industry: data.profile.industry || '',
        });
      } catch { toast.error('Failed to load profile'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, skills: JSON.stringify(form.skills), experience: JSON.stringify(form.experience), education: JSON.stringify(form.education) };
      const { data } = await API.put('/profile/me', payload);
      setProfile(data.profile);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const { data } = await API.put('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ ...user, avatar: data.avatar });
      setAvatarPreview('');
      setAvatarFile(null);
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to upload avatar'); }
    finally { setUploadingAvatar(false); }
  };

  const uploadResume = async () => {
    if (!resumeFile) return;
    setUploadingResume(true);
    try {
      const fd = new FormData();
      fd.append('resume', resumeFile);
      const { data } = await API.put('/profile/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(p => ({ ...p, resume: data.resume }));
      setResumeFile(null);
      toast.success('Resume uploaded!');
    } catch { toast.error('Failed to upload resume'); }
    finally { setUploadingResume(false); }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm(p => ({ ...p, skills: [...p.skills, s] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  if (loading) return <PageLoader />;

  const avatar = avatarPreview || user?.avatar;

  return (
    <div className="page-container max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">My Profile</h1>
        {!editMode
          ? <button onClick={() => setEditMode(true)} className="btn-secondary"><HiPencil /> Edit Profile</button>
          : <div className="flex gap-3">
              <button onClick={() => setEditMode(false)} className="btn-ghost"><HiX /> Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <Spinner size="sm" color="white" /> : <HiSave />} Save Changes
              </button>
            </div>
        }
      </div>

      <div className="space-y-6">
        {/* Avatar + basic info */}
        <div className="card p-7">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-md">
                  {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
                </div>
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 shadow-sm">
                  <HiCamera className="text-slate-500 text-sm" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              {avatarFile && (
                <button onClick={uploadAvatar} disabled={uploadingAvatar} className="btn-primary text-xs px-3 py-1.5">
                  {uploadingAvatar ? <Spinner size="sm" color="white" /> : 'Upload'}
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Full Name" icon={<HiUser />} value={user?.name} readOnly />
                <InfoField label="Email" icon={<HiMail />} value={user?.email} readOnly />
                <EditableField label="Phone" icon={<HiPhone />} name="phone" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} editMode={editMode} />
                <EditableField label="Location" icon={<HiLocationMarker />} name="location" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))} editMode={editMode} />
              </div>

              {editMode ? (
                <div>
                  <label className="label">Headline</label>
                  <input value={form.headline} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))}
                    placeholder="e.g. Senior React Developer | Open to opportunities"
                    className="input" />
                </div>
              ) : form.headline ? (
                <p className="text-slate-600 font-medium">{form.headline}</p>
              ) : null}

              {editMode ? (
                <div>
                  <label className="label">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    rows={4} placeholder="Tell recruiters about yourself…" className="input resize-none" />
                </div>
              ) : form.bio ? (
                <p className="text-sm text-slate-500 leading-relaxed">{form.bio}</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="card p-7">
          <h2 className="font-display font-semibold text-slate-800 mb-5 flex items-center gap-2"><HiLink /> Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EditableField label="Website" icon={<HiGlobe />} name="website" value={form.website}
              onChange={e => setForm(p => ({ ...p, website: e.target.value }))} editMode={editMode} placeholder="https://yoursite.com" />
            <EditableField label="LinkedIn" icon={<FaLinkedin />} name="linkedin" value={form.linkedin}
              onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} editMode={editMode} placeholder="linkedin.com/in/you" />
            {isJobseeker && <EditableField label="GitHub" icon={<FaGithub />} name="github" value={form.github}
              onChange={e => setForm(p => ({ ...p, github: e.target.value }))} editMode={editMode} placeholder="github.com/you" />}
          </div>
        </div>

        {/* Skills (jobseeker) */}
        {isJobseeker && (
          <div className="card p-7">
            <h2 className="font-display font-semibold text-slate-800 mb-5">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold border border-primary-100">
                  {skill}
                  {editMode && <button onClick={() => removeSkill(skill)} className="hover:text-red-500"><HiX className="text-xs" /></button>}
                </span>
              ))}
              {form.skills.length === 0 && !editMode && <p className="text-sm text-slate-400">No skills added yet</p>}
            </div>
            {editMode && (
              <div className="flex gap-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill and press Enter…" className="input flex-1" />
                <button onClick={addSkill} className="btn-secondary px-4"><HiPlus /></button>
              </div>
            )}
          </div>
        )}

        {/* Resume (jobseeker) */}
        {isJobseeker && (
          <div className="card p-7">
            <h2 className="font-display font-semibold text-slate-800 mb-5 flex items-center gap-2"><HiDocumentText /> Resume</h2>
            {profile?.resume?.url ? (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <HiDocumentText className="text-red-500 text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{profile.resume.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Uploaded {profile.resume.uploadedAt ? new Date(profile.resume.uploadedAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <a href={profile.resume.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-3 py-2">View</a>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-4">No resume uploaded yet</p>
            )}
            <div className="flex items-center gap-3 mt-4">
              <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])}
                className="block text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
              {resumeFile && (
                <button onClick={uploadResume} disabled={uploadingResume} className="btn-primary text-sm">
                  {uploadingResume ? <Spinner size="sm" color="white" /> : 'Upload Resume'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Company Info (recruiter) */}
        {isRecruiter && (
          <div className="card p-7">
            <h2 className="font-display font-semibold text-slate-800 mb-5 flex items-center gap-2"><HiBriefcase /> Company Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditableField label="Company Name" name="companyName" value={form.companyName}
                onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} editMode={editMode} />
              <EditableField label="Company Website" name="companyWebsite" value={form.companyWebsite}
                onChange={e => setForm(p => ({ ...p, companyWebsite: e.target.value }))} editMode={editMode} />
              <EditableField label="Industry" name="industry" value={form.industry}
                onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} editMode={editMode} />
              <EditableField label="Company Size" name="companySize" value={form.companySize}
                onChange={e => setForm(p => ({ ...p, companySize: e.target.value }))} editMode={editMode} />
            </div>
            {editMode ? (
              <div className="mt-4">
                <label className="label">About Company</label>
                <textarea value={form.companyDescription}
                  onChange={e => setForm(p => ({ ...p, companyDescription: e.target.value }))}
                  rows={4} className="input resize-none" placeholder="Describe your company…" />
              </div>
            ) : form.companyDescription ? (
              <p className="mt-4 text-sm text-slate-500 leading-relaxed">{form.companyDescription}</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

const InfoField = ({ label, icon, value }) => (
  <div>
    <label className="label">{label}</label>
    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700">
      <span className="text-slate-400">{icon}</span> {value || <span className="text-slate-400">—</span>}
    </div>
  </div>
);

const EditableField = ({ label, icon, name, value, onChange, editMode, placeholder }) => (
  <div>
    <label className="label">{label}</label>
    {editMode ? (
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>}
        <input name={name} value={value} onChange={onChange} placeholder={placeholder || label}
          className={`input ${icon ? 'pl-9' : ''}`} />
      </div>
    ) : (
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700">
        {icon && <span className="text-slate-400 text-sm">{icon}</span>}
        {value || <span className="text-slate-400">—</span>}
      </div>
    )}
  </div>
);
