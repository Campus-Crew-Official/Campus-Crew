import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { TicketModal } from '../../components/common/TicketModal';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Ticket,
  Clock,
  Briefcase,
  Megaphone,
  ArrowRight,
  Loader2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EventDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Volunteer application modal
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [volunteerNote, setVolunteerNote] = useState('');
  const [applyingVolunteer, setApplyingVolunteer] = useState(false);

  const { data: event, isLoading, refetch } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const res = await api.get(`/events/${slug}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-2" />
        <span className="text-xs text-slate-500">Loading event information...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState title="Event not found" description="The requested event does not exist or has been removed." />
      </div>
    );
  }

  const isRegistered = event.userRegistration?.status === 'REGISTERED';
  const seatsRemaining = Math.max(0, event.maxCapacity - event.registeredCount);
  const isFull = seatsRemaining === 0;

  const handleRegister = async () => {
    if (!user) {
      addToast('Please sign in to register for events.', 'info');
      return;
    }

    setRegistering(true);
    try {
      const res = await api.post(`/events/${event.id}/register`);
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
      addToast('Seat booked successfully! View your official ticket pass.', 'success');
      await refetch();
      setTicketModalOpen(true);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to release your seat? This action cannot be undone.')) {
      return;
    }

    setCancelling(true);
    try {
      await api.delete(`/events/${event.id}/register`);
      addToast('Registration cancelled. Seat released.', 'info');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleApplyVolunteer = async (e) => {
    e?.preventDefault();
    if (!user) {
      addToast('Please sign in to apply for volunteer opportunities.', 'info');
      return;
    }

    setApplyingVolunteer(true);
    try {
      await api.post(`/volunteers/opportunities/${selectedOpp.id}/apply`, {
        note: volunteerNote,
      });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      addToast('Volunteer application submitted to event coordinator!', 'success');
      setSelectedOpp(null);
      setVolunteerNote('');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setApplyingVolunteer(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="h-64 sm:h-96 w-full bg-slate-900 relative">
        <img
          src={event.bannerUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200'}
          alt={event.title}
          className="w-full h-full object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute bottom-6 left-0 right-0 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={event.category} />
            <Badge variant={event.status} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{event.title}</h1>
          <p className="text-xs sm:text-sm text-brand-300 font-semibold flex items-center gap-2">
            Organized by <Link to={`/clubs/${event.club?.slug}`} className="underline hover:text-white">{event.club?.name}</Link>
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Volunteers */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Event */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Event Overview</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Volunteer Opportunities Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Volunteer Opportunities</h3>
                <p className="text-xs text-slate-500">
                  Join the organizing team, coordinate participants, and earn verified contribution points
                </p>
              </div>
              <Briefcase className="w-5 h-5 text-brand-600" />
            </div>

            <div className="space-y-4">
              {event.volunteerOpportunities?.length > 0 ? (
                event.volunteerOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{opp.roleTitle}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          {opp.volunteersNeeded} Needed
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{opp.description}</p>
                      {opp.skillsRequired && (
                        <p className="text-[11px] text-slate-400">
                          <strong>Skills:</strong> {opp.skillsRequired}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedOpp(opp)}
                      className="py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shrink-0 shadow-sm transition-all active:scale-98 self-start sm:self-auto"
                    >
                      Apply as Volunteer
                    </button>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No volunteer positions open"
                  description="All volunteer roles for this event have been filled or are not published yet."
                />
              )}
            </div>
          </div>

          {/* Announcements */}
          {event.announcements?.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold text-slate-900">Event Announcements</h3>
              </div>
              <div className="space-y-3">
                {event.announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <h5 className="font-bold text-xs text-slate-800">{ann.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Registration Card & Logistics */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6 sticky top-20">
            {/* Seat Availability Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Seat Capacity</span>
                <span className={isFull ? 'text-rose-600' : 'text-brand-600'}>
                  {seatsRemaining} of {event.maxCapacity} seats remaining
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFull ? 'bg-rose-500' : 'bg-brand-600'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((event.registeredCount / event.maxCapacity) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Registration Action Buttons */}
            <div>
              {isRegistered ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Confirmed Reservation
                    </div>
                    <p className="text-[11px] text-emerald-700 font-mono">
                      Ticket: {event.userRegistration?.ticketCode}
                    </p>
                  </div>

                  <button
                    onClick={() => setTicketModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                  >
                    <Ticket className="w-4 h-4" /> View Entry Pass & QR Code
                  </button>

                  <button
                    onClick={handleCancelRegistration}
                    disabled={cancelling}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-all"
                  >
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Cancel Registration & Release Seat
                  </button>
                </div>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed text-center"
                >
                  Event Registration Full
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-102 active:scale-98"
                >
                  {registering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Ticket className="w-4 h-4" />
                  )}
                  Register Now (Free Entry)
                </button>
              )}
            </div>

            {/* Event Logistics */}
            <div className="space-y-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">Date & Time</strong>
                  <span>{new Date(event.startDateTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="block text-slate-400">
                    {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">Venue Location</strong>
                  <span>{event.venue}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">Registration Deadline</strong>
                  <span>{new Date(event.registrationEndDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket QR Modal */}
      {event.userRegistration && (
        <TicketModal
          isOpen={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
          registration={event.userRegistration}
          event={event}
        />
      )}

      {/* Volunteer Apply Modal */}
      {selectedOpp && (
        <Modal
          isOpen={!!selectedOpp}
          onClose={() => setSelectedOpp(null)}
          title={`Apply as Volunteer: ${selectedOpp.roleTitle}`}
        >
          <form onSubmit={handleApplyVolunteer} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Volunteer Note / Motivation
              </label>
              <textarea
                required
                rows={3}
                placeholder="Mention why you would like to help with this role and any relevant experience..."
                value={volunteerNote}
                onChange={(e) => setVolunteerNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={applyingVolunteer}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
            >
              {applyingVolunteer ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Submit Volunteer Application
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
