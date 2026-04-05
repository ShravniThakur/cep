import React from 'react';
import { Link } from 'react-router-dom';
import { HiBriefcase } from 'react-icons/hi';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-blue-500 flex items-center justify-center">
                <HiBriefcase className="text-white text-lg" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900">
                Talent<span className="text-gradient">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Connecting ambitious talent with exceptional opportunities. Your next career move starts here.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[FaGithub, FaTwitter, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                  <Icon className="text-base" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-slate-800 mb-4 text-sm">For Job Seekers</h4>
            <ul className="space-y-2.5">
              {[['Browse Jobs', '/jobs'], ['Create Profile', '/profile'], ['Applied Jobs', '/applied-jobs'], ['Saved Jobs', '/bookmarks']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-slate-500 hover:text-primary-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-slate-800 mb-4 text-sm">For Recruiters</h4>
            <ul className="space-y-2.5">
              {[['Post a Job', '/post-job'], ['Dashboard', '/dashboard'], ['View Applicants', '/dashboard'], ['Sign Up', '/register']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-slate-500 hover:text-primary-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} TalentBridge. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map(label => (
              <a key={label} href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
