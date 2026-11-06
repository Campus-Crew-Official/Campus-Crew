import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Plus,
  Users,
  Download,
  Edit2,
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
  Ticket,
} from 'lucide-react';

export const EventManagerPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingParticipantsEvent, setViewingParticipantsEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: 'WORKSHOP',
    venue: '',
    startDateTime: '',
    endDateTime: '',
    registrationStartDate: '',
    registrationEndDate: '',
    maxCapacity: 100,
    bannerUrl: '',
    status: 'REGISTRATION_OPEN',
  });
  const [submitting, setSubmitting] = useState(false);

  // Get coordinator club
  const { data: clubsData } = useQuery({
    queryKey: ['coordinator-clubs'],
    queryFn: () => api.get('/clubs'),
  });

  const clubs = clubsData?.data || [];
  const managedClub = clubs.find((c) => c.studentCoordinatorId === user?.id) || clubs[0];
  const clubId = managedClub?.id;

  const { data: eventsData, isLoading, refetch } = useQuery({
    queryKey: ['coordinator-events', clubId],
    queryFn: () => api.get(`/events?clubId=${clubId}`),
    enabled: !!clubId,
  });

  const events = eventsData?.data || [];

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      category: 'WORKSHOP',
      venue: '',
      startDateTime: '',
      endDateTime: '',
      registrationStartDate: '',
      registrationEndDate: '',
      maxCapacity: 100,
      bannerUrl: '',
      status: 'REGISTRATION_OPEN',
    });
    setEditingEvent(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      slug: evt.slug,
      description: evt.description,
      category: evt.category,
      venue: evt.venue,
      startDateTime: new Date(evt.startDateTime).toISOString().slice(0, 16),
      endDateTime: new Date(evt.endDateTime).toISOString().slice(0, 16),
      registrationStartDate: new Date(evt.registrationStartDate).toISOString().slice(0, 16),
      registrationEndDate: new Date(evt.registrationEndDate).toISOString().slice(0, 16),
      maxCapacity: evt.maxCapacity,
      bannerUrl: evt.bannerUrl || '',
      status: evt.status,
    });
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, formData);
        addToast('Event updated successfully! Attendees notified.', 'success');
      } else {
        await api.post('/events', { ...formData, clubId });
        addToast('Event published successfully!', 'success');
      }
      setIsCreateOpen(false);
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewParticipants = async (evt) => {
    setViewingParticipantsEvent(evt);
    setLoadingParticipants(true);
    try {
      const res = await api.get(`/events/${evt.id}/participants`);
      setParticipants(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingParticipants(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Event Operations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize workshops, manage registrations, track capacity, and download event reports
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3.5 px-6">Event Title</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Date & Venue</th>
                  <th className="py-3.5 px-6">Bookings / Capacity</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => {
                  const percent = Math.min(100, Math.round((evt.registeredCount / evt.maxCapacity) * 100));
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 max-w-xs truncate">
                        {evt.title}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={evt.category} />
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div>{new Date(evt.startDateTime).toLocaleDateString()}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{evt.venue}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">
                            {evt.registeredCount} / {evt.maxCapacity}
                          </span>
                          <span className="text-[10px] text-slate-400">({percent}%)</span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-100 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${percent >= 100 ? 'bg-rose-500' : 'bg-brand-600'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={evt.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewParticipants(evt)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="View registered attendees"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          <a
                            href={`http://localhost:5001/api/analytics/events/${evt.id}/export-csv`}
                            download
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Download CSV report"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleOpenEdit(evt)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No events created yet"
            description="Schedule campus hackathons, workshops, and guest lectures to accept registrations."
          />
        )}
      </div>

      {/* Create / Edit Event Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingEvent ? 'Modify Event Details' : 'Create New Event'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HackCampus 2026"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="WORKSHOP">WORKSHOP</option>
                <option value="HACKATHON">HACKATHON</option>
                <option value="COMPETITION">COMPETITION</option>
                <option value="SEMINAR">SEMINAR</option>
                <option value="CULTURAL_FEST">CULTURAL FEST</option>
                <option value="SPORTS">SPORTS</option>
                <option value="SOCIAL_CAUSE">SOCIAL CAUSE</option>
                <option value="MEETUP">MEETUP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Slug (URL Identifier)
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Venue Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Main Auditorium Hall B"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDateTime}
                onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endDateTime}
                onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Registration Opens
              </label>
              <input
                type="datetime-local"
                required
                value={formData.registrationStartDate}
                onChange={(e) =>
                  setFormData({ ...formData, registrationStartDate: e.target.value })
                }
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Registration Closes
              </label>
              <input
                type="datetime-local"
                required
                value={formData.registrationEndDate}
                onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Capacity (Seats)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="REGISTRATION_OPEN">REGISTRATION OPEN</option>
                <option value="PUBLISHED">PUBLISHED (Upcoming)</option>
                <option value="REGISTRATION_CLOSED">REGISTRATION CLOSED</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DRAFT">DRAFT</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Banner URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="Event agenda, requirements, guest speakers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save & Publish Event'}
          </button>
        </form>
      </Modal>

      {/* Participants Modal */}
      {viewingParticipantsEvent && (
        <Modal
          isOpen={!!viewingParticipantsEvent}
          onClose={() => setViewingParticipantsEvent(null)}
          title={`Registered Attendees: ${viewingParticipantsEvent.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">
                {participants.length} Confirmed Seats
              </span>
              <a
                href={`http://localhost:5001/api/analytics/events/${viewingParticipantsEvent.id}/export-csv`}
                download
                className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Attendance CSV
              </a>
            </div>

            {loadingParticipants ? (
              <TableSkeleton rows={4} />
            ) : participants.length > 0 ? (
              <div className="max-h-96 overflow-y-auto border rounded-xl divide-y text-xs">
                {participants.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{p.user?.name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {p.user?.rollNumber} • {p.user?.department} • Ticket: {p.ticketCode}
                      </span>
                    </div>

                    <div>
                      {p.attendance ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Checked In at {new Date(p.attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                          Not Checked In
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No students registered yet.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
