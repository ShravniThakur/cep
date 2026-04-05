import React from 'react';

export const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const colors = { primary: 'border-primary-600', white: 'border-white', gray: 'border-slate-400' };
  return (
    <div className={`${sizes[size]} rounded-full border-2 border-slate-200 ${colors[color]} border-t-transparent animate-spin`} />
  );
};

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <Spinner size="lg" />
    <p className="text-sm text-slate-500 animate-pulse">Loading...</p>
  </div>
);

export const SkeletonCard = () => (
  <div className="card p-6 flex flex-col gap-4">
    <div className="flex items-start gap-3">
      <div className="skeleton w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="skeleton h-3 w-1/3 rounded-lg" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="skeleton h-6 w-20 rounded-lg" />
      <div className="skeleton h-6 w-16 rounded-lg" />
    </div>
    <div className="skeleton h-3 w-1/2 rounded-lg" />
    <div className="flex gap-2">
      <div className="skeleton h-5 w-16 rounded-lg" />
      <div className="skeleton h-5 w-16 rounded-lg" />
      <div className="skeleton h-5 w-16 rounded-lg" />
    </div>
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div className="text-5xl text-slate-300">{icon}</div>
    <h3 className="font-display font-semibold text-lg text-slate-700">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
    {action}
  </div>
);
