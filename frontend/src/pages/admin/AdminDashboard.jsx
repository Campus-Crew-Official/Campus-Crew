import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/Skeleton';
import {
  ShieldCheck,
  Users,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/analytics/admin'),
  });

  const stats = statsData?.data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              PLATFORM GOVERNANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Administration Portal
          </h1>
          <p className="text-xs text-slate-300">
            Real-time platform metrics, account status governance, and club constitution approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/club-approvals"
            className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Club Approvals ({stats.pendingClubs || 0})</span>
          </Link>
          <Link
            to="/admin/users"
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Students</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalStudents || 0}</p>
          <Link to="/admin/users" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Directory <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Clubs</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalClubs || 0}</p>
          <span className="text-[11px] text-amber-600 font-bold">
            {stats.pendingClubs || 0} pending review
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Campus Events</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalEvents || 0}</p>
          <span className="text-[11px] text-slate-500 font-medium">
            {stats.totalRegistrations || 0} total bookings
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contribution Points</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.totalPoints || 0} pts</p>
          <span className="text-[11px] text-slate-400">Awarded across campus</span>
        </div>
      </div>

      {/* Two Column Grid: Recent Registrations & Events Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">Recently Enrolled Students</h3>
            <Link to="/admin/users" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Full Directory
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentUsers?.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{u.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {u.email} • {u.department}
                  </span>
                </div>
                <Badge variant={u.role} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">Recent Campus Events</h3>
            <Link to="/events" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              All Events
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentEvents?.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{evt.title}</span>
                  <span className="text-[11px] text-slate-400">
                    {evt.club?.name} • {new Date(evt.startDateTime).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant={evt.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
