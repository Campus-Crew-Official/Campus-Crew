import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../contexts/ToastContext';
import {
  CheckSquare,
  Clock,
  MessageSquare,
  Send,
  UserCheck,
  AlertTriangle,
  MapPin,
  Calendar,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MyTasksPage = () => {
  const [selectedTaskComments, setSelectedTaskComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Replacement request modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [replacementReason, setReplacementReason] = useState('');
  const [submittingReplacement, setSubmittingReplacement] = useState(false);

  const { addToast } = useToast();

  const { data: tasksData, isLoading: loadingTasks, refetch: refetchTasks } = useQuery({
    queryKey: ['my-tasks-full'],
    queryFn: () => api.get('/tasks/my-tasks'),
  });

  const { data: volunteerData, refetch: refetchVolunteer } = useQuery({
    queryKey: ['my-volunteer-assignments'],
    queryFn: () => api.get('/volunteers/my-volunteer'),
  });

  const tasks = tasksData?.data || [];
  const assignments = volunteerData?.data?.assignments || [];

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (newStatus === 'COMPLETED') {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        addToast('Task marked as COMPLETED! Notified coordinator for verification.', 'success');
      } else {
        addToast(`Task marked as ${newStatus}`, 'info');
      }
      refetchTasks();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openComments = async (task) => {
    setSelectedTaskComments(task);
    setLoadingComments(true);
    try {
      const res = await api.get(`/tasks/${task.id}/comments`);
      setComments(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async (e) => {
    e?.preventDefault();
    if (!newComment.trim() || !selectedTaskComments) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/tasks/${selectedTaskComments.id}/comments`, {
        comment: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
      refetchTasks();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleRequestReplacement = async (e) => {
    e?.preventDefault();
    if (!replacementReason.trim() || !selectedAssignment) return;

    setSubmittingReplacement(true);
    try {
      await api.post(`/volunteers/assignments/${selectedAssignment.id}/replace`, {
        reason: replacementReason.trim(),
      });
      addToast('Replacement request submitted to the coordinator.', 'info');
      setSelectedAssignment(null);
      setReplacementReason('');
      refetchVolunteer();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingReplacement(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Volunteer Tasks & Responsibilities</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update your task progress, coordinate with team leaders, and earn verified points
        </p>
      </div>

      {/* Volunteer Duty Shifts Section */}
      {assignments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-600" />
            <span>Active Volunteer Duty Shifts</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((asgn) => (
              <div
                key={asgn.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 card-hover"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-brand-600 uppercase">
                      {asgn.event?.title}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900 mt-0.5">{asgn.roleName}</h4>
                  </div>
                  <Badge variant={asgn.status} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Reporting Time:{' '}
                      {new Date(asgn.reportingTime).toLocaleDateString()} at{' '}
                      {new Date(asgn.reportingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Location: {asgn.reportingVenue}</span>
                  </div>
                  {asgn.notes && (
                    <p className="text-[11px] text-slate-500 pt-1 italic">Note: {asgn.notes}</p>
                  )}
                </div>

                {asgn.status === 'ASSIGNED' && (
                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedAssignment(asgn)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Request Replacement if Unavailable
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Checklist Board */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-brand-600" />
          <span>Assigned Action Items</span>
        </h3>

        {loadingTasks ? (
          <TableSkeleton rows={4} />
        ) : tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 card-hover"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {task.event?.title}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900">{task.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Badge variant={task.priority} />
                    <Badge variant={task.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due {new Date(task.deadline).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-emerald-600">+{task.pointsValue} Points</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openComments(task)}
                      className="text-xs font-bold text-slate-600 hover:text-brand-600 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Notes ({task._count?.comments || 0})
                    </button>

                    {task.status !== 'VERIFIED' && (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">MARK COMPLETED</option>
                      </select>
                    )}

                    {task.status === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Verified & Points Credited
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No tasks assigned"
            description="You currently have no tasks assigned to your volunteer profile."
          />
        )}
      </div>

      {/* Comments Thread Modal */}
      {selectedTaskComments && (
        <Modal
          isOpen={!!selectedTaskComments}
          onClose={() => setSelectedTaskComments(null)}
          title={`Task Discussion: ${selectedTaskComments.title}`}
        >
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-3 p-1">
              {loadingComments ? (
                <div className="text-center py-6 text-xs text-slate-400">Loading comments...</div>
              ) : comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{c.user.name}</span>
                      <span className="text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No comments yet. Post a status note below.
                </div>
              )}
            </div>

            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a progress note..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold disabled:opacity-50 transition-all"
              >
                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </Modal>
      )}

      {/* Replacement Request Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title="Report Volunteer Unavailability"
        >
          <form onSubmit={handleRequestReplacement} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              If an emergency prevents you from attending your shift as{' '}
              <strong>{selectedAssignment.roleName}</strong>, please submit a reason. The coordinator will be notified in real-time to assign a replacement volunteer.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Unavailability
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain the conflict or emergency..."
                value={replacementReason}
                onChange={(e) => setReplacementReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReplacement}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
            >
              {submittingReplacement ? 'Submitting...' : 'Confirm Replacement Request'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
