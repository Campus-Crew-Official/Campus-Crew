import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Calendar,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  QrCode,
  Megaphone,
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-28 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>The Next-Generation University Campus Operating System</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Unify Your College Clubs, Events & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-violet-400">Volunteers</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
              Say goodbye to messy spreadsheets and buried WhatsApp announcements. Discover clubs, register for hackathons with concurrency-safe seat booking, apply for volunteer roles, and track verified contribution points on a single modern platform.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to={user ? (user.role === 'ADMIN' ? '/admin' : user.role === 'COORDINATOR' ? '/coordinator' : '/student') : '/register'}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <span>{user ? 'Enter Your Workspace' : 'Get Started as Student'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/events"
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700/80 backdrop-blur-md transition-all hover:scale-105"
              >
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>Explore Campus Events</span>
              </Link>
            </div>

            {/* Highlights pill grid */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Concurrency-Safe Registrations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-Time Socket.IO Reminders
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> QR-Verified Attendance & Points
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600">Enterprise Capabilities</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Built for Modern Campus Life</h3>
          <p className="text-sm text-slate-500">
            A cohesive suite of specialized tools solving the fragmentation of traditional collegiate club operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Centralized Club Directory</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Explore all technical, cultural, and sports clubs with faculty leads, open recruitment drives, member rosters, and one-click membership applications.
            </p>
            <Link to="/clubs" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700">
              Browse clubs directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Race-Free Event Registration</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Never worry about overbooking. Backed by PostgreSQL row-level locks and transactional capacity checks, registrations are 100% concurrency-safe.
            </p>
            <Link to="/events" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700">
              View upcoming events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Verified Volunteer Recognition</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Apply for event roles, receive task assignments, and earn verified contribution points only after coordinators inspect and approve completed tasks.
            </p>
            <Link to="/leaderboard" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700">
              Check points leaderboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Role-Based Experience Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden border border-slate-800">
          <div className="max-w-2xl space-y-4 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Tri-Role Access Model</span>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              One Unified Platform, Three Tailored Experiences
            </h3>
            <p className="text-sm text-slate-400">
              Role-based authorization built directly into backend middleware and database schemas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                STUDENT & VOLUNTEER
              </span>
              <h5 className="font-bold text-base text-white">Student Experience</h5>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• Instant digital pass with entry QR code</li>
                <li>• Task board with progress updates</li>
                <li>• 1-click replacement requests if unavailable</li>
                <li>• Personal points audit trail</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CLUB COORDINATOR
              </span>
              <h5 className="font-bold text-base text-white">Coordinator Experience</h5>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• Candidate recruitment shortlisting & SOP review</li>
                <li>• Volunteer task delegation with deadlines</li>
                <li>• QR entry gate scanner for attendance</li>
                <li>• CSV report export for faculty records</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PLATFORM ADMIN
              </span>
              <h5 className="font-bold text-base text-white">Administrator Experience</h5>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• Campus club creation review & approval</li>
                <li>• Student account governance & suspension</li>
                <li>• Real-time campus engagement metrics</li>
                <li>• Global system activity logs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
