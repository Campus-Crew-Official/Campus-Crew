import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../../components/common/Badge';
import { QRScannerModal } from '../../components/common/QRScannerModal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  QrCode,
  CheckCircle2,
  Calendar,
  Users,
  Download,
  Search,
  Check,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AttendancePage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [selectedEventId, setSelectedEventId] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Get coordinator club & events
  const { data: clubsData } = useQuery({
    queryKey: ['coordinator-clubs'],
    queryFn: () => api.get('/clubs'),
  });

  const clubs = clubsData?.data || [];
  const managedClub = clubs.find((c) => c.studentCoordinatorId === user?.id) || clubs[0];
  const clubId = managedClub?.id;

  const { data: eventsData } = useQuery({
    queryKey: ['coordinator-events', clubId],
    queryFn: () => api.get(`/events?clubId=${clubId}`),
    enabled: !!clubId,
  });

  const events = eventsData?.data || [];
  const activeEventId = selectedEventId || events[0]?.id;

  // Selected event object
  const activeEvent = events.find((e) => e.id === activeEventId);

  // Fetch event attendance stats & attendees
  const { data: statsData, isLoading, refetch } = useQuery({
    queryKey: ['attendance-stats', activeEventId],
    queryFn: () => api.get(`/attendance/events/${activeEventId}/stats`),
    enabled: !!activeEventId,
  });

  const stats = statsData?.data || {};
  const attendances = stats.attendances || [];

  // Also fetch full registered participants to see who attended vs who hasn't
  const { data: participantsData, refetch: refetchParticipants } = useQuery({
    queryKey: ['event-participants', activeEventId],
    queryFn: () => api.get(`/events/${activeEventId}/participants`),
    enabled: !!activeEventId,
  });

  const participants = participantsData?.data || [];

  const handleManualCheckIn = async (userId, studentName) => {
    try {
      await api.post(`/attendance/events/${activeEventId}/manual`, { userId });
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      addToast(`Attendance recorded manually for ${studentName}`, 'success');
      refetch();
      refetchParticipants();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.ticketCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">QR Gate Attendance Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time participant check-in verification and attendance statistics
          </p>
        </div>

        {activeEvent && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4" /> Launch QR Scanner
            </button>

            <a
              href={`http://localhost:5001/api/analytics/events/${activeEvent.id}/export-csv`}
              download
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </a>
          </div>
        )}
      </div>

      {/* Event Selector & Stats Banner */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 md:col-span-2">
            <Calendar className="w-5 h-5 text-brand-600 shrink-0" />
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Selected Event
              </span>
              <select
                value={activeEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full py-1 text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({new Date(e.startDateTime).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Check-Ins
              </span>
              <span className="text-xl font-black text-slate-900">
                {stats.checkedInCount || 0} / {stats.registeredCount || 0}
              </span>
            </div>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Attendance Rate
              </span>
              <span className="text-xl font-black text-emerald-600">
                {stats.percentage || 0}%
              </span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      )}

      {/* Participants Attendance Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-800">Registration Check-In Roster</h3>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by student or ticket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : filteredParticipants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/30">
                  <th className="py-3 px-6">Ticket Code</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6">Roll Number</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Verification Method</th>
                  <th className="py-3 px-6 text-right">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParticipants.map((p) => {
                  const isCheckedIn = !!p.attendance;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-brand-600">
                        {p.ticketCode}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-900">{p.user?.name}</td>
                      <td className="py-3.5 px-6 text-slate-500 font-mono">{p.user?.rollNumber}</td>
                      <td className="py-3.5 px-6 text-slate-500">{p.user?.department}</td>
                      <td className="py-3.5 px-6">
                        {isCheckedIn ? (
                          <span className="font-semibold text-slate-700">
                            {p.attendance.method === 'QR_SCAN' ? '📱 QR Code Scan' : '✍️ Manual Desk Check'}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending Entry</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {isCheckedIn ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Checked In ({new Date(p.attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        ) : (
                          <button
                            onClick={() => handleManualCheckIn(p.userId, p.user?.name)}
                            className="py-1 px-3 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-bold text-xs transition-colors"
                          >
                            Mark Present
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No attendees found"
            description="No registered students matching the current search query."
          />
        )}
      </div>

      {/* QR Scanner Modal */}
      {activeEvent && (
        <QRScannerModal
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          event={activeEvent}
          onCheckInSuccess={() => {
            refetch();
            refetchParticipants();
          }}
        />
      )}
    </div>
  );
};
