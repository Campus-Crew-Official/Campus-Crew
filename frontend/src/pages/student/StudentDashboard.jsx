import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/common/Badge';
import { TicketModal } from '../../components/common/TicketModal';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Users,
  CheckSquare,
  Award,
  ArrowRight,
  Ticket,
  Clock,
  Sparkles,
  Megaphone,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fetch my events
  const { data: myEventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => api.get('/events/my-events'),
  });

  // Fetch my tasks
  const { data: myTasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => api.get('/tasks/my-tasks'),
  });

  // Fetch my contributions
  const { data: contributionsData } = useQuery({
    queryKey: ['my-contributions'],
    queryFn: () => api.get('/contributions/my-history'),
  });

  const registeredEvents = myEventsData?.data || [];
  const assignedTasks = myTasksData?.data || [];
  const totalPoints = contributionsData?.data?.totalPoints || 0;
  const pendingTasks = assignedTasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl"></div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Student & Volunteer Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Track your upcoming events, complete assigned volunteer responsibilities, and build your verified campus contribution profile.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Events</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{registeredEvents.length}</p>
          <Link to="/student/events" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View Entry Passes <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingTasks.length}</p>
          <Link to="/student/tasks" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Task Progress <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Clubs</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{user?.clubMemberships?.length || 0}</p>
          <Link to="/student/clubs" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Manage Memberships <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Points</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{totalPoints} pts</p>
          <Link to="/student/contributions" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Points Ledger <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Registered Events & Assigned Volunteer Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Registered Events with Entry Tickets */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Registered Events</h3>
              <p className="text-xs text-slate-400">Scan passes at entry gate for verification</p>
            </div>
            <Link to="/student/events" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              All Passes
            </Link>
          </div>

          {loadingEvents ? (
            <CardSkeleton />
          ) : registeredEvents.length > 0 ? (
            <div className="space-y-3">
              {registeredEvents.slice(0, 3).map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4 card-hover"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand-600 uppercase">
                      {reg.event.club?.name}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{reg.event.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{new Date(reg.event.startDateTime).toLocaleDateString()}</span> •
                      <span className="font-mono text-slate-700 font-semibold">{reg.ticketCode}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedTicket(reg)}
                    className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shrink-0 shadow-sm transition-all active:scale-95"
                    title="View QR Entry Pass"
                  >
                    <Ticket className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No events registered"
              description="Explore campus workshops and hackathons to book your seat."
              action={
                <Link
                  to="/events"
                  className="py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
                >
                  Explore Events
                </Link>
              }
            />
          )}
        </div>

        {/* Right: Assigned Tasks Roster */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">My Volunteer Tasks</h3>
              <p className="text-xs text-slate-400">Complete tasks to earn verified points</p>
            </div>
            <Link to="/student/tasks" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Task Board
            </Link>
          </div>

          {loadingTasks ? (
            <CardSkeleton />
          ) : assignedTasks.length > 0 ? (
            <div className="space-y-3">
              {assignedTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4 card-hover"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority} />
                      <Badge variant={task.status} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{task.title}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due {new Date(task.deadline).toLocaleDateString()} • {task.pointsValue} pts
                    </p>
                  </div>

                  <Link
                    to="/student/tasks"
                    className="py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold shrink-0 transition-colors"
                  >
                    Update
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tasks currently assigned"
              description="Apply for volunteer opportunities on upcoming event pages to get assigned responsibilities."
            />
          )}
        </div>
      </div>

      {/* Ticket QR Modal */}
      {selectedTicket && (
        <TicketModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          registration={selectedTicket}
          event={selectedTicket.event}
        />
      )}
    </div>
  );
};
