import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { TicketModal } from '../../components/common/TicketModal';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../contexts/ToastContext';
import { Calendar, MapPin, Ticket, XCircle, Clock, ExternalLink } from 'lucide-react';

export const MyEventsPage = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { addToast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-registered-events'],
    queryFn: () => api.get('/events/my-events'),
  });

  const registrations = data?.data || [];

  const handleCancel = async (eventId, title) => {
    if (!window.confirm(`Release your seat for "${title}"?`)) return;

    try {
      await api.delete(`/events/${eventId}/register`);
      addToast('Seat released successfully.', 'info');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Event Passes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed registrations and digital QR tickets for venue entry
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" /> Browse More Events
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : registrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 card-hover"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                      {reg.event.club?.name}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-0.5 line-clamp-1">
                      {reg.event.title}
                    </h3>
                  </div>
                  <Badge variant={reg.status} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{new Date(reg.event.startDateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(reg.event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{reg.event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-700 pt-1">
                    <Ticket className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Ticket Code: {reg.ticketCode}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedTicket(reg)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  <Ticket className="w-4 h-4" /> Open Entry QR Pass
                </button>

                <button
                  onClick={() => handleCancel(reg.eventId, reg.event.title)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Release seat reservation"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No registered events"
          description="You haven't reserved tickets for upcoming events yet."
          action={
            <Link
              to="/events"
              className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
            >
              Explore Events
            </Link>
          }
        />
      )}

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
