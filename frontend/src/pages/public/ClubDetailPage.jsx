import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Users,
  Calendar,
  Briefcase,
  Megaphone,
  Mail,
  Phone,
  Shield,
  Plus,
  ArrowRight,
  Check,
  Loader2,
  FileText,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ClubDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('events');

  // Apply to recruitment drive state
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [sop, setSop] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);

  const { data: club, isLoading, refetch } = useQuery({
    queryKey: ['club', slug],
    queryFn: async () => {
      const res = await api.get(`/clubs/${slug}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-2" />
        <span className="text-xs text-slate-500">Loading club details...</span>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState title="Club not found" description="The requested club profile does not exist or has been removed." />
      </div>
    );
  }

  const isMember = club.members?.some((m) => m.userId === user?.id);

  const handleJoinClub = async () => {
    if (!user) {
      addToast('Please sign in to join student clubs.', 'info');
      return;
    }
    try {
      await api.post(`/clubs/${club.id}/join`);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      addToast(`Joined ${club.name} successfully!`, 'success');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleApplyRecruitment = async (e) => {
    e?.preventDefault();
    if (!user) {
      addToast('Please sign in to apply.', 'info');
      return;
    }
    setSubmittingApp(true);
    try {
      await api.post(`/recruitment/drives/${selectedDrive.id}/apply`, {
        statementOfPurpose: sop,
        experience,
        portfolioUrl: portfolioUrl || null,
      });
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      addToast('Application submitted successfully to the committee!', 'success');
      setSelectedDrive(null);
      setSop('');
      setExperience('');
      setPortfolioUrl('');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="h-64 sm:h-80 w-full bg-slate-900 relative">
        <img
          src={club.bannerUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200'}
          alt={club.name}
          className="w-full h-full object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute bottom-6 left-0 right-0 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={club.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(club.name)}&background=6366f1&color=fff`}
              alt={club.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover bg-white border-4 border-white shadow-2xl shrink-0"
            />
            <div>
              <Badge variant={club.category} className="mb-1.5" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{club.name}</h1>
              <p className="text-xs text-slate-300 mt-1">
                Faculty Lead: {club.facultyCoordinator}
              </p>
            </div>
          </div>

          <div>
            {isMember ? (
              <span className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold backdrop-blur-md">
                <Check className="w-4 h-4 text-emerald-400" /> Active Club Member
              </span>
            ) : (
              <button
                onClick={handleJoinClub}
                className="py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
              >
                Join {club.name}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">About the Club</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{club.description}</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'events'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Upcoming Events ({club.events?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('recruitment')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'recruitment'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Recruitment Drives ({club.recruitmentDrives?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'announcements'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Announcements ({club.announcements?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'members'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Members Roster ({club.members?.length || 0})
            </button>
          </div>

          {/* Tab 1: Events */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {club.events?.length > 0 ? (
                club.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={evt.category} />
                        <span className="text-xs text-slate-400">
                          {new Date(evt.startDateTime).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900">{evt.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{evt.venue}</p>
                    </div>

                    <Link
                      to={`/events/${evt.slug}`}
                      className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold self-start sm:self-auto shrink-0 transition-colors"
                    >
                      View Event Pass
                    </Link>
                  </div>
                ))
              ) : (
                <EmptyState title="No upcoming events" description="This club currently has no scheduled events." />
              )}
            </div>
          )}

          {/* Tab 2: Recruitment Drives */}
          {activeTab === 'recruitment' && (
            <div className="space-y-4">
              {club.recruitmentDrives?.length > 0 ? (
                club.recruitmentDrives.map((drive) => (
                  <div
                    key={drive.id}
                    className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 card-hover"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            OPEN RECRUITMENT
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Deadline:{' '}
                            {new Date(drive.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-lg text-slate-900 mt-2">{drive.title}</h4>
                      </div>

                      <button
                        onClick={() => setSelectedDrive(drive)}
                        className="py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20"
                      >
                        Apply for Role
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{drive.description}</p>
                    <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100 font-medium">
                      <strong>Requirements:</strong> {drive.requirements}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No active recruitment drives"
                  description="Recruitment for core team positions is currently closed."
                />
              )}
            </div>
          )}

          {/* Tab 3: Announcements */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              {club.announcements?.length > 0 ? (
                club.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-6 bg-white rounded-3xl border shadow-sm space-y-2 ${
                      ann.isPinned ? 'border-brand-400/80 bg-brand-50/20' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ann.isPinned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700">
                            📌 PINNED
                          </span>
                        )}
                        <h4 className="font-bold text-base text-slate-900">{ann.title}</h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
                    <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Posted by {ann.author?.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No announcements yet" description="Club coordinators have not published notices." />
              )}
            </div>
          )}

          {/* Tab 4: Members */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {club.members?.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.name)}&background=6366f1&color=fff`}
                        alt={m.user.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{m.user.name}</h5>
                        <p className="text-xs text-slate-400">
                          {m.user.rollNumber} • {m.user.department}
                        </p>
                      </div>
                    </div>
                    <Badge variant={m.role} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contact & Leadership */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400">Club Leadership</h4>

            <div className="space-y-3 pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Faculty Mentor</span>
                <p className="text-xs font-bold text-slate-800">{club.facultyCoordinator}</p>
              </div>

              {club.studentCoordinator && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Student Coordinator</span>
                  <p className="text-xs font-bold text-slate-800">{club.studentCoordinator.name}</p>
                  <p className="text-xs text-slate-500">{club.studentCoordinator.email}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{club.contactEmail}</span>
              </div>
              {club.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{club.contactPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recruitment Application Modal */}
      {selectedDrive && (
        <Modal
          isOpen={!!selectedDrive}
          onClose={() => setSelectedDrive(null)}
          title={`Apply: ${selectedDrive.title}`}
        >
          <form onSubmit={handleApplyRecruitment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Statement of Purpose (Why are you interested?)
              </label>
              <textarea
                required
                rows={4}
                placeholder="Explain what motivates you, what initiatives you'd like to run, and how you will contribute..."
                value={sop}
                onChange={(e) => setSop(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Relevant Experience & Skills
              </label>
              <textarea
                rows={3}
                placeholder="List technical tools, event coordination history, or past leadership positions..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Portfolio or GitHub URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/your-username"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submittingApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
            >
              {submittingApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Submit Candidate Application
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
