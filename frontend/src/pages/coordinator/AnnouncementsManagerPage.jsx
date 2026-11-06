import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Megaphone, Plus, Pin, Clock, Users, Loader2 } from 'lucide-react';

export const AnnouncementsManagerPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    targetRole: 'ALL',
    isPinned: false,
    eventId: '',
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

  // Get club events
  const { data: eventsData } = useQuery({
    queryKey: ['coordinator-events', clubId],
    queryFn: () => api.get(`/events?clubId=${clubId}`),
    enabled: !!clubId,
  });

  const events = eventsData?.data || [];

  // Get announcements for club
  const { data: annData, isLoading, refetch } = useQuery({
    queryKey: ['club-announcements', clubId],
    queryFn: () => api.get(`/announcements?clubId=${clubId}`),
    enabled: !!clubId,
  });

  const announcements = annData?.data || [];

  const handleCreateAnnouncement = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/announcements', {
        ...form,
        clubId,
        eventId: form.eventId || null,
      });

      addToast('Announcement published and broadcast to members!', 'success');
      setIsCreateOpen(false);
      setForm({ title: '', content: '', targetRole: 'ALL', isPinned: false, eventId: '' });
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await api.patch(`/announcements/${id}/pin`);
      addToast(res.message, 'info');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Announcements & Broadcasts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch real-time updates and pin essential instructions for club members & volunteers
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Broadcast Announcement
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-800">Published Notice Board</h3>
          <span className="text-xs text-slate-400 font-medium">{announcements.length} Notices</span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : announcements.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                  ann.isPinned ? 'bg-amber-50/20' : 'hover:bg-slate-50'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {ann.isPinned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Pin className="w-3 h-3 text-amber-600" /> PINNED NOTICE
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      Target: {ann.targetRole}
                    </span>
                    {ann.event && (
                      <span className="text-xs font-semibold text-brand-600">
                        Event: {ann.event.title}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-slate-900">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <span>Author: {ann.author?.name}</span> •
                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="self-end sm:self-start">
                  <button
                    onClick={() => handleTogglePin(ann.id)}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      ann.isPinned
                        ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                    {ann.isPinned ? 'Unpin' : 'Pin to Top'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No announcements published"
            description="Broadcast important schedule changes or meetings to your club members."
          />
        )}
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Broadcast Announcement"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Announcement Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mandatory Briefing on Thursday 5PM"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <select
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="ALL">ALL (Campus & Members)</option>
                <option value="MEMBERS">MEMBERS ONLY</option>
                <option value="VOLUNTEERS">EVENT VOLUNTEERS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Associate with Event (Optional)
              </label>
              <select
                value={form.eventId}
                onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="">-- General Club Notice --</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notice Content
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write the announcement text..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <span>Pin this announcement to top of club notice board</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
          >
            {submitting ? 'Broadcasting...' : 'Publish & Broadcast Real-Time Alert'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
