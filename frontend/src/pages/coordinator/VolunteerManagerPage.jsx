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
  UserCheck,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  Loader2,
} from 'lucide-react';

export const VolunteerManagerPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [selectedEventId, setSelectedEventId] = useState('');
  const [isCreateOppOpen, setIsCreateOppOpen] = useState(false);
  const [oppForm, setOppForm] = useState({
    roleTitle: '',
    description: '',
    skillsRequired: '',
    volunteersNeeded: 4,
  });
  const [submittingOpp, setSubmittingOpp] = useState(false);

  // Assign Volunteer Modal
  const [assigningApp, setAssigningApp] = useState(null);
  const [assignForm, setAssignForm] = useState({
    roleName: '',
    reportingTime: '',
    reportingVenue: '',
    notes: '',
  });
  const [submittingAssign, setSubmittingAssign] = useState(false);

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

  // Get opportunities for active event
  const { data: oppsData, isLoading, refetch } = useQuery({
    queryKey: ['event-opportunities', activeEventId],
    queryFn: () => api.get(`/volunteers/events/${activeEventId}/opportunities`),
    enabled: !!activeEventId,
  });

  const opportunities = oppsData?.data || [];

  const handleCreateOpp = async (e) => {
    e?.preventDefault();
    setSubmittingOpp(true);
    try {
      await api.post(`/volunteers/events/${activeEventId}/opportunities`, oppForm);
      addToast('Volunteer role published! Club members notified.', 'success');
      setIsCreateOppOpen(false);
      setOppForm({ roleTitle: '', description: '', skillsRequired: '', volunteersNeeded: 4 });
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingOpp(false);
    }
  };

  const handleOpenAssign = (opp, app) => {
    setAssigningApp({ opp, app });
    setAssignForm({
      roleName: opp.roleTitle,
      reportingTime: new Date().toISOString().slice(0, 16),
      reportingVenue: 'Main Registration Desk',
      notes: 'Please arrive 30 minutes before doors open.',
    });
  };

  const handleAssignVolunteer = async (e) => {
    e?.preventDefault();
    if (!assigningApp) return;

    setSubmittingAssign(true);
    try {
      await api.post(`/volunteers/opportunities/${assigningApp.opp.id}/assign`, {
        applicationId: assigningApp.app.id,
        roleName: assignForm.roleName,
        reportingTime: assignForm.reportingTime,
        reportingVenue: assignForm.reportingVenue,
        notes: assignForm.notes,
      });

      addToast(`Assigned ${assigningApp.app.user.name} to ${assignForm.roleName}!`, 'success');
      setAssigningApp(null);
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingAssign(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Volunteer Team Coordinator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Recruit student volunteers, assign duty shifts, and monitor replacement alerts
          </p>
        </div>

        {activeEventId && (
          <button
            onClick={() => setIsCreateOppOpen(true)}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Volunteer Role
          </button>
        )}
      </div>

      {/* Event Selector */}
      {events.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700">Select Event:</span>
          <select
            value={activeEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({new Date(e.startDateTime).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Opportunities & Applicants Accordion */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : opportunities.length > 0 ? (
        <div className="space-y-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {opp.volunteersNeeded} Volunteers Needed
                    </span>
                    <span className="text-xs text-slate-400">
                      {opp.assignments?.length || 0} Assigned
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 mt-1">{opp.roleTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{opp.description}</p>
                </div>
              </div>

              {/* Confirmed Roster */}
              {opp.assignments?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Confirmed Duty Shift Volunteers
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {opp.assignments.map((asgn) => (
                      <div
                        key={asgn.id}
                        className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                          asgn.status === 'REPLACEMENT_REQUESTED'
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : 'bg-emerald-50/60 border-emerald-100 text-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold block">{asgn.user.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {asgn.user.rollNumber} • {asgn.reportingVenue}
                          </span>
                        </div>
                        <Badge variant={asgn.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applicant Submissions */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Candidate Applications ({opp.applications?.length || 0})
                </span>

                {opp.applications?.length > 0 ? (
                  <div className="divide-y divide-slate-100 border rounded-2xl overflow-hidden">
                    {opp.applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{app.user.name}</span>
                            <span className="text-[11px] text-slate-400">
                              {app.user.rollNumber} • {app.user.department}
                            </span>
                          </div>
                          {app.note && (
                            <p className="text-slate-600 mt-1 italic text-[11px]">"{app.note}"</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant={app.status} />
                          {app.status === 'PENDING' && (
                            <button
                              onClick={() => handleOpenAssign(opp, app)}
                              className="py-1 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                            >
                              Assign Duty
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    No student applications received yet for this role.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No volunteer roles created for this event"
          description="Define roles such as 'Check-In Lead', 'Technical Monitor', or 'Stage Support'."
        />
      )}

      {/* Add Opportunity Modal */}
      <Modal
        isOpen={isCreateOppOpen}
        onClose={() => setIsCreateOppOpen(false)}
        title="Add Event Volunteer Requirement"
      >
        <form onSubmit={handleCreateOpp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Role Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wi-Fi & Technical Network Assistant"
              value={oppForm.roleTitle}
              onChange={(e) => setOppForm({ ...oppForm, roleTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Volunteers Needed
            </label>
            <input
              type="number"
              min="1"
              required
              value={oppForm.volunteersNeeded}
              onChange={(e) => setOppForm({ ...oppForm, volunteersNeeded: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Responsibilities Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain duties during the event..."
              value={oppForm.description}
              onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skills Required (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Basic networking, hardware, punctual"
              value={oppForm.skillsRequired}
              onChange={(e) => setOppForm({ ...oppForm, skillsRequired: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submittingOpp}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
          >
            {submittingOpp ? 'Publishing...' : 'Publish Volunteer Opportunity'}
          </button>
        </form>
      </Modal>

      {/* Assign Volunteer Modal */}
      {assigningApp && (
        <Modal
          isOpen={!!assigningApp}
          onClose={() => setAssigningApp(null)}
          title={`Assign Volunteer: ${assigningApp.app.user.name}`}
        >
          <form onSubmit={handleAssignVolunteer} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Designated Responsibility Role
              </label>
              <input
                type="text"
                required
                value={assignForm.roleName}
                onChange={(e) => setAssignForm({ ...assignForm, roleName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reporting Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={assignForm.reportingTime}
                onChange={(e) => setAssignForm({ ...assignForm, reportingTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reporting Location / Desk
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gate 2 Badge Distribution Desk"
                value={assignForm.reportingVenue}
                onChange={(e) => setAssignForm({ ...assignForm, reportingVenue: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Coordinator Instructions / Shift Notes
              </label>
              <textarea
                rows={2}
                value={assignForm.notes}
                onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submittingAssign}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
            >
              {submittingAssign ? 'Confirming...' : 'Confirm Assignment & Notify Volunteer'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
