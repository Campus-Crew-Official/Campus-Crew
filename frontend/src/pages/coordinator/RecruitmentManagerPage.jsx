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
  Briefcase,
  Plus,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RecruitmentManagerPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [driveForm, setDriveForm] = useState({
    title: '',
    description: '',
    requirements: '',
    deadline: '',
  });
  const [submittingDrive, setSubmittingDrive] = useState(false);

  // Review applicant modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('UNDER_REVIEW');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Selected drive to view applicants
  const [activeDriveId, setActiveDriveId] = useState(null);

  // Get coordinator club
  const { data: clubsData } = useQuery({
    queryKey: ['coordinator-clubs'],
    queryFn: () => api.get('/clubs'),
  });

  const clubs = clubsData?.data || [];
  const managedClub = clubs.find((c) => c.studentCoordinatorId === user?.id) || clubs[0];
  const clubId = managedClub?.id;

  // Get drives for this club
  const { data: drivesData, isLoading: loadingDrives, refetch: refetchDrives } = useQuery({
    queryKey: ['club-drives', clubId],
    queryFn: () => api.get(`/recruitment/clubs/${clubId}/drives`),
    enabled: !!clubId,
  });

  const drives = drivesData?.data || [];

  // Default active drive
  const currentDriveId = activeDriveId || drives[0]?.id;

  // Get applicants for active drive
  const { data: applicantsData, isLoading: loadingApplicants, refetch: refetchApplicants } = useQuery({
    queryKey: ['drive-applicants', currentDriveId],
    queryFn: () => api.get(`/recruitment/drives/${currentDriveId}/applicants`),
    enabled: !!currentDriveId,
  });

  const applicants = applicantsData?.data || [];

  const handleCreateDrive = async (e) => {
    e?.preventDefault();
    setSubmittingDrive(true);
    try {
      await api.post(`/recruitment/clubs/${clubId}/drives`, driveForm);
      addToast('Recruitment drive opened successfully!', 'success');
      setIsCreateOpen(false);
      setDriveForm({ title: '', description: '', requirements: '', deadline: '' });
      refetchDrives();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingDrive(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e?.preventDefault();
    if (!selectedApp) return;

    setSubmittingReview(true);
    try {
      await api.patch(`/recruitment/applications/${selectedApp.id}/status`, {
        status: reviewStatus,
        reviewNotes,
      });

      if (reviewStatus === 'SELECTED') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }

      addToast(`Candidate marked as ${reviewStatus}`, 'success');
      setSelectedApp(null);
      setReviewNotes('');
      refetchApplicants();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruitment Drives & Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish core committee recruitment and review candidate submissions
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Open Recruitment Drive
        </button>
      </div>

      {/* Drives Selector Tabs */}
      {drives.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {drives.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDriveId(d.id)}
              className={`p-4 rounded-2xl border text-left shrink-0 transition-all ${
                currentDriveId === d.id
                  ? 'border-brand-500 bg-brand-50/40 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <h4 className="font-bold text-xs text-slate-900 truncate max-w-xs">{d.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span>{d._count?.applications || 0} Applicants</span> •
                <span>Ends {new Date(d.deadline).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Applicants Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-800">Candidate Submissions</h3>
          <span className="text-xs text-slate-400 font-medium">{applicants.length} Total</span>
        </div>

        {loadingApplicants ? (
          <TableSkeleton rows={4} />
        ) : applicants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/30">
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Statement of Purpose</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={app.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user.name)}&background=6366f1&color=fff`}
                        alt={app.user.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{app.user.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{app.user.rollNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {app.user.department} (Yr {app.user.year})
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="line-clamp-2 text-slate-600 text-[11px] leading-relaxed">
                        {app.statementOfPurpose}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={app.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setReviewStatus(app.status);
                          setReviewNotes(app.reviewNotes || '');
                        }}
                        className="py-1.5 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No applicants yet"
            description="Candidates who apply for this recruitment drive will appear here for review."
          />
        )}
      </div>

      {/* Create Drive Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Open New Recruitment Drive">
        <form onSubmit={handleCreateDrive} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Drive Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2026 Core Committee Induction"
              value={driveForm.title}
              onChange={(e) => setDriveForm({ ...driveForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Application Deadline
            </label>
            <input
              type="datetime-local"
              required
              value={driveForm.deadline}
              onChange={(e) => setDriveForm({ ...driveForm, deadline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Objectives
            </label>
            <textarea
              required
              rows={3}
              placeholder="Roles available (e.g. Frontend, Design, Operations, Sponsoship)..."
              value={driveForm.description}
              onChange={(e) => setDriveForm({ ...driveForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Eligibility & Skill Requirements
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Prior hackathon participation, proficiency with React or Figma..."
              value={driveForm.requirements}
              onChange={(e) => setDriveForm({ ...driveForm, requirements: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submittingDrive}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
          >
            {submittingDrive ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Publish Recruitment Call'}
          </button>
        </form>
      </Modal>

      {/* Review Candidate Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Candidate Review: ${selectedApp.user.name}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <span className="font-bold block text-slate-800">Student Profile:</span>
              <p>Email: {selectedApp.user.email} • Phone: {selectedApp.user.phone || 'N/A'}</p>
              <p>Roll: {selectedApp.user.rollNumber} • Dept: {selectedApp.user.department} (Year {selectedApp.user.year})</p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Statement of Purpose:
              </span>
              <p className="p-3 rounded-xl bg-slate-50 text-xs text-slate-800 leading-relaxed border border-slate-100">
                {selectedApp.statementOfPurpose}
              </p>
            </div>

            {selectedApp.experience && (
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Experience:
                </span>
                <p className="text-xs text-slate-600">{selectedApp.experience}</p>
              </div>
            )}

            {selectedApp.portfolioUrl && (
              <div className="pt-1">
                <a
                  href={selectedApp.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Candidate Portfolio / GitHub
                </a>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Application Decision Status
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="SHORTLISTED">SHORTLISTED (For Interview)</option>
                  <option value="SELECTED">SELECTED (Inducted into Club)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Feedback / Interview Notes for Candidate
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Shortlisted for round 2 interview on Friday 4PM in Innovation Lab..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
            >
              {submittingReview ? 'Saving...' : 'Update Status & Notify Candidate'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
