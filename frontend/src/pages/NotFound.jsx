import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="text-8xl font-display font-black text-slate-100 select-none mb-4">404</div>
      <h1 className="font-display font-bold text-3xl text-slate-900 mb-3">Page Not Found</h1>
      <p className="text-slate-500 max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/"    className="btn-primary">Go Home</Link>
        <Link to="/jobs" className="btn-secondary">Browse Jobs</Link>
      </div>
    </div>
  );
}
