import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Users, Heart, Shield, Award, Calendar, Github } from 'lucide-react';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            {/* Brand column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Campus<span className="text-brand-500">Crew</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The centralized operating system for college clubs, recruitment drives, hackathons, volunteer coordination, and verified contribution recognition.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-400" /> PostgreSQL & Prisma Enterprise Architecture
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Explore Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/clubs" className="hover:text-white transition-colors">Registered Student Clubs</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors">Upcoming Campus Events</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition-colors">Volunteer Points Leaderboard</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Student Registration</Link></li>
              </ul>
            </div>

            {/* System Roles */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">User Roles</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-300 font-semibold">Student / Volunteer:</span> Register, apply, complete tasks</li>
                <li><span className="text-slate-300 font-semibold">Club Coordinator:</span> Publish events, review SOPs, manage tasks</li>
                <li><span className="text-slate-300 font-semibold">Platform Admin:</span> Approve clubs, monitor platform metrics</li>
              </ul>
            </div>

            {/* Demo Notice */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Academic Project</h4>
              <p className="text-xs leading-relaxed text-slate-400">
                Developed as a full-stack engineering demonstration featuring atomic concurrency controls, live WebSocket broadcasts, and role-based access security.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-brand-300">
                Seed: admin@campuscrew.edu / Password123!
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Campus Crew Systems. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with precision and care for university communities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
