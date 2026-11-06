import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/Skeleton';
import {
  Users,
  Calendar,
  Briefcase,
  CheckSquare,
  QrCode,
  Megaphone,
  Download,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';

export const CoordinatorDashboard = () => {
  const { user } = useAuth();

  // Fetch coordinator's clubs
  const { data: clubsData, isLoading: loadingClubs } = useQuery({
    queryKey: ['coordinator-clubs'],
    queryFn: () => api.get('/clubs'),
  });

  const clubs = clubsData?.data || [];
  // Find clubs where user is studentCoordinator or member with COORDINATOR role, or default to first club
  const managedClub =
    clubs.find((c) => c.studentCoordinatorId === user?.id) ||
    clubs[0];

  const clubId = managedClub?.id;

  // Fetch stats for this club
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['coordinator-stats', clubId],
    queryFn: () => api.get(`/analytics/coordinator/clubs/${clubId}`),
    enabled: !!clubId,
  });

  const stats = statsData?.data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              COORDINATOR WORKSPACE
            </span>
            {managedClub && <Badge variant={managedClub.category} />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {managedClub ? managedClub.name : 'Club Management Hub'}
          </h1>
          <p className="text-xs text-slate-300">
            Coordinated by {user?.name} • Faculty Lead: {managedClub?.facultyCoordinator}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/coordinator/events"
            className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            + Create Event
          </Link>
          <Link
            to="/coordinator/recruitment"
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
          >
            + Open Recruitment
          </Link>
          <Link
            to="/coordinator/attendance"
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" /> Check-In Scanner
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Members</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalMembers || 0}</p>
          <Link to="/coordinator/members" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Manage Committee <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Applicants</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.pendingApplications || 0}</p>
          <Link to="/coordinator/recruitment" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Review SOPs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Event Bookings</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalRegistrations || 0}</p>
          <Link to="/coordinator/events" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View Attendees <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasks to Verify</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.tasks?.COMPLETED || 0}</p>
          <Link to="/coordinator/tasks" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Award Points <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Events & Task Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events Manager list preview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Upcoming Events</h3>
              <p className="text-xs text-slate-400">Live seat bookings & check-ins</p>
            </div>
            <Link to="/coordinator/events" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Manage All
            </Link>
          </div>

          <div className="space-y-3">
            {stats.upcomingEvents?.length > 0 ? (
              stats.upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 card-hover"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={evt.status} />
                      <span className="text-xs text-slate-400">
                        {new Date(evt.startDateTime).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{evt.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Bookings: {evt.registeredCount} / {evt.maxCapacity} seats filled
                    </p>
                  </div>

                  <a
                    href={`http://localhost:5001/api/analytics/events/${evt.id}/export-csv`}
                    download
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 transition-colors"
                    title="Export Attendees CSV"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No events currently scheduled. Click "+ Create Event" above.
              </div>
            )}
          </div>
        </div>

        {/* Task pipeline status breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Volunteer Tasks Pipeline</h3>
              <p className="text-xs text-slate-400">Progress across all event operations</p>
            </div>
            <Link to="/coordinator/tasks" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Task Board
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center space-y-1">
              <span className="text-xs font-bold text-amber-700 block">Pending</span>
              <span className="text-2xl font-black text-amber-900">{stats.tasks?.PENDING || 0}</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center space-y-1">
              <span className="text-xs font-bold text-indigo-700 block">In Progress</span>
              <span className="text-2xl font-black text-indigo-900">{stats.tasks?.IN_PROGRESS || 0}</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-center space-y-1">
              <span className="text-xs font-bold text-purple-700 block">Awaiting Verification</span>
              <span className="text-2xl font-black text-purple-900">{stats.tasks?.COMPLETED || 0}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-700 block">Verified & Credited</span>
              <span className="text-2xl font-black text-emerald-900">{stats.tasks?.VERIFIED || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
