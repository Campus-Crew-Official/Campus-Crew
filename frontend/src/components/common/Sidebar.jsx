import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from './Badge';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Award,
  Bell,
  UserCheck,
  Briefcase,
  QrCode,
  Megaphone,
  ShieldCheck,
  Layers,
  LogOut,
  User,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/student', label: 'My Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/clubs', label: 'My Clubs', icon: Users },
    { to: '/student/applications', label: 'My Applications', icon: Briefcase },
    { to: '/student/events', label: 'My Registered Events', icon: Calendar },
    { to: '/student/tasks', label: 'Volunteer Tasks', icon: CheckSquare },
    { to: '/student/contributions', label: 'Contribution Points', icon: Award },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/profile', label: 'Account Settings', icon: User },
  ];

  const coordinatorLinks = [
    { to: '/coordinator', label: 'Club Hub', icon: LayoutDashboard, end: true },
    { to: '/coordinator/members', label: 'Club Members', icon: Users },
    { to: '/coordinator/recruitment', label: 'Recruitment Drives', icon: Briefcase },
    { to: '/coordinator/events', label: 'Event Manager', icon: Calendar },
    { to: '/coordinator/volunteers', label: 'Volunteer Roster', icon: UserCheck },
    { to: '/coordinator/tasks', label: 'Task Board', icon: CheckSquare },
    { to: '/coordinator/attendance', label: 'QR Attendance', icon: QrCode },
    { to: '/coordinator/announcements', label: 'Announcements', icon: Megaphone },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Platform Analytics', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/club-approvals', label: 'Club Approvals', icon: ShieldCheck },
  ];

  const links =
    role === 'ADMIN'
      ? adminLinks
      : role === 'COORDINATOR'
      ? coordinatorLinks
      : studentLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800 shadow-xl">
      {/* User profile card */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
            alt={user.name}
            className="w-10 h-10 rounded-xl object-cover border-2 border-brand-500/40 shadow-sm"
          />
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-white truncate">{user.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant={user.role} className="scale-75 origin-left" />
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 truncate font-medium">
          {user.rollNumber} • {user.department}
        </p>
      </div>

      {/* Navigation section */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {role === 'ADMIN' ? 'Platform Governance' : role === 'COORDINATOR' ? 'Club Management' : 'Student Space'}
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}

        {/* Cross-workspace links if user is Coordinator or Admin */}
        {(role === 'COORDINATOR' || role === 'ADMIN') && (
          <div className="pt-4 mt-4 border-t border-slate-800">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Student Perspective
            </div>
            <NavLink
              to="/student"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 ${
                  isActive ? 'bg-slate-800 text-white' : ''
                }`
              }
            >
              <Layers className="w-4 h-4 shrink-0 text-brand-400" />
              <span>Student Dashboard</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Footer logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/20">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
