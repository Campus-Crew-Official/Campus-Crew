import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ClubsPage } from './pages/public/ClubsPage';
import { ClubDetailPage } from './pages/public/ClubDetailPage';
import { EventsPage } from './pages/public/EventsPage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { LeaderboardPage } from './pages/public/LeaderboardPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyClubsPage } from './pages/student/MyClubsPage';
import { MyApplicationsPage } from './pages/student/MyApplicationsPage';
import { MyEventsPage } from './pages/student/MyEventsPage';
import { MyTasksPage } from './pages/student/MyTasksPage';
import { MyContributionsPage } from './pages/student/MyContributionsPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Coordinator Pages
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard';
import { ClubMembersPage } from './pages/coordinator/ClubMembersPage';
import { RecruitmentManagerPage } from './pages/coordinator/RecruitmentManagerPage';
import { EventManagerPage } from './pages/coordinator/EventManagerPage';
import { VolunteerManagerPage } from './pages/coordinator/VolunteerManagerPage';
import { TaskManagerPage } from './pages/coordinator/TaskManagerPage';
import { AttendancePage } from './pages/coordinator/AttendancePage';
import { AnnouncementsManagerPage } from './pages/coordinator/AnnouncementsManagerPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ClubApprovalsPage } from './pages/admin/ClubApprovalsPage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/:slug" element={<ClubDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Route>

      {/* Student Protected Space */}
      <Route element={<DashboardLayout />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/clubs" element={<MyClubsPage />} />
        <Route path="/student/applications" element={<MyApplicationsPage />} />
        <Route path="/student/events" element={<MyEventsPage />} />
        <Route path="/student/tasks" element={<MyTasksPage />} />
        <Route path="/student/volunteer-tasks" element={<Navigate to="/student/tasks" replace />} />
        <Route path="/student/contributions" element={<MyContributionsPage />} />
        <Route path="/student/notifications" element={<NotificationsPage />} />
        <Route path="/student/profile" element={<ProfilePage />} />
      </Route>

      {/* Coordinator Protected Space */}
      <Route element={<DashboardLayout allowedRoles={['COORDINATOR', 'ADMIN']} />}>
        <Route path="/coordinator" element={<CoordinatorDashboard />} />
        <Route path="/coordinator/members" element={<ClubMembersPage />} />
        <Route path="/coordinator/recruitment" element={<RecruitmentManagerPage />} />
        <Route path="/coordinator/events" element={<EventManagerPage />} />
        <Route path="/coordinator/volunteers" element={<VolunteerManagerPage />} />
        <Route path="/coordinator/events/:id/volunteers" element={<Navigate to="/coordinator/volunteers" replace />} />
        <Route path="/coordinator/tasks" element={<TaskManagerPage />} />
        <Route path="/coordinator/events/:id/tasks" element={<Navigate to="/coordinator/tasks" replace />} />
        <Route path="/coordinator/attendance" element={<AttendancePage />} />
        <Route path="/coordinator/announcements" element={<AnnouncementsManagerPage />} />
      </Route>

      {/* Admin Protected Space */}
      <Route element={<DashboardLayout allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/club-approvals" element={<ClubApprovalsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
