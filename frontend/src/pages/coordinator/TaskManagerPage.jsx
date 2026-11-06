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
  CheckSquare,
  Plus,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TaskManagerPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [selectedEventId, setSelectedEventId] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    assignedToUserId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: '',
    pointsValue: 5,
  });
  const [submittingTask, setSubmittingTask] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

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
  const activeEventId = selectedEventId || events[0]?.id;

  // Get club members to populate assignee dropdown
  const { data: clubDetails } = useQuery({
    queryKey: ['club-members', clubId],
    queryFn: () => api.get(`/clubs/${clubId}`),
    enabled: !!clubId,
  });

  const members = clubDetails?.data?.members || [];

  // Get tasks for active event
  const { data: tasksData, isLoading, refetch } = useQuery({
    queryKey: ['event-tasks', activeEventId],
    queryFn: () => api.get(`/tasks/events/${activeEventId}`),
    enabled: !!activeEventId,
  });

  const tasks = tasksData?.data || [];

  const handleCreateTask = async (e) => {
    e?.preventDefault();
    setSubmittingTask(true);
    try {
      await api.post(`/tasks/events/${activeEventId}`, taskForm);
      addToast('Task assigned successfully! Volunteer notified.', 'success');
      setIsCreateOpen(false);
      setTaskForm({
        assignedToUserId: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        deadline: '',
        pointsValue: 5,
      });
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleVerifyTask = async (taskId, title, points) => {
    setVerifyingId(taskId);
    try {
      await api.patch(`/tasks/${taskId}/verify`);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      addToast(`Verified "${title}"! Awarded ${points} points.`, 'success');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Volunteer Task Board</h1>
          <p className="text-xs text-slate-500 mt-1">
            Delegate operational action items, track execution, and verify completed milestones
          </p>
        </div>

        {activeEventId && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create & Assign Task
          </button>
        )}
      </div>

      {/* Event Selector */}
      {events.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700">Event Context:</span>
          <select
            value={activeEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Task List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3.5 px-6">Task Item</th>
                  <th className="py-3.5 px-6">Assigned Volunteer</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Deadline</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 max-w-xs">
                      <span className="font-bold text-slate-900 block truncate">{task.title}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{task.description}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignedToUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedToUser?.name || 'V')}&background=6366f1&color=fff`}
                          alt={task.assignedToUser?.name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <span className="font-semibold text-slate-800">{task.assignedToUser?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={task.priority} />
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {new Date(task.deadline).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={task.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      {task.status === 'COMPLETED' ? (
                        <button
                          onClick={() => handleVerifyTask(task.id, task.title, task.pointsValue)}
                          disabled={verifyingId === task.id}
                          className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 ml-auto transition-all active:scale-95"
                        >
                          {verifyingId === task.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Verify & Award {task.pointsValue} Pts
                        </button>
                      ) : task.status === 'VERIFIED' ? (
                        <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">In Execution</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No tasks created for this event"
            description="Assign tasks to volunteers for venue setup, participant registration, or audio-visual checks."
          />
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create & Assign Volunteer Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assignee (Club Member / Volunteer)
            </label>
            <select
              required
              value={taskForm.assignedToUserId}
              onChange={(e) => setTaskForm({ ...taskForm, assignedToUserId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
            >
              <option value="">-- Choose Volunteer --</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name} ({m.user.rollNumber} - {m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Set up participant QR scanners at Gate 2"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contribution Points Value
              </label>
              <input
                type="number"
                min="1"
                required
                value={taskForm.pointsValue}
                onChange={(e) => setTaskForm({ ...taskForm, pointsValue: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Deadline
            </label>
            <input
              type="datetime-local"
              required
              value={taskForm.deadline}
              onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Task Instructions
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide step-by-step instructions and required materials..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submittingTask}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
          >
            {submittingTask ? 'Assigning...' : 'Assign Task to Volunteer'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
