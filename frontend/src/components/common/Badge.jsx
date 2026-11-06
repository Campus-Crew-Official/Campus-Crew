import React from 'react';

const BADGE_STYLES = {
  // Roles
  ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  COORDINATOR: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  STUDENT: 'bg-blue-100 text-blue-700 border-blue-200',
  SECRETARY: 'bg-amber-100 text-amber-700 border-amber-200',
  CORE_MEMBER: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  MEMBER: 'bg-slate-100 text-slate-700 border-slate-200',

  // Statuses
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  SUSPENDED: 'bg-rose-100 text-rose-700 border-rose-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700 border-amber-200',
  REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',

  // Recruitment & Applications
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
  SHORTLISTED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  SELECTED: 'bg-emerald-100 text-emerald-700 border-emerald-200',

  // Events
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  PUBLISHED: 'bg-blue-100 text-blue-700 border-blue-200',
  REGISTRATION_OPEN: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REGISTRATION_CLOSED: 'bg-amber-100 text-amber-700 border-amber-200',
  ONGOING: 'bg-purple-100 text-purple-700 border-purple-200',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',

  // Tasks & Priorities
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
  HIGH: 'bg-amber-100 text-amber-700 border-amber-200',
  URGENT: 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  VERIFIED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  BLOCKED: 'bg-rose-100 text-rose-700 border-rose-200',

  // Registration
  REGISTERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  WAITLISTED: 'bg-amber-100 text-amber-700 border-amber-200',

  // Category
  TECHNICAL: 'bg-sky-100 text-sky-800 border-sky-200',
  CULTURAL: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  SPORTS: 'bg-orange-100 text-orange-800 border-orange-200',
  SOCIAL: 'bg-teal-100 text-teal-800 border-teal-200',
};

export const Badge = ({ children, variant, className = '' }) => {
  const style = BADGE_STYLES[variant] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      {children || variant?.replace('_', ' ')}
    </span>
  );
};
