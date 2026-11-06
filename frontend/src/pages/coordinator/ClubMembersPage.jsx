import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Users, Search, UserMinus, ShieldCheck, Mail } from 'lucide-react';

export const ClubMembersPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');

  // Get coordinator's managed club
  const { data: clubsData } = useQuery({
    queryKey: ['coordinator-clubs'],
    queryFn: () => api.get('/clubs'),
  });

  const clubs = clubsData?.data || [];
  const managedClub = clubs.find((c) => c.studentCoordinatorId === user?.id) || clubs[0];
  const clubId = managedClub?.id;

  const { data: clubDetails, isLoading, refetch } = useQuery({
    queryKey: ['club-members', clubId],
    queryFn: () => api.get(`/clubs/${clubId}`),
    enabled: !!clubId,
  });

  const members = clubDetails?.data?.members || [];

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.patch(`/clubs/${clubId}/members/${memberId}/role`, { role: newRole });
      addToast(`Member role updated to ${newRole}`, 'success');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the club?`)) return;

    try {
      await api.delete(`/clubs/${clubId}/members/${memberId}`);
      addToast(`${memberName} removed from club`, 'info');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.user.name.toLowerCase().includes(search.toLowerCase()) ||
      m.user.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.user.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Club Membership Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organization roster for {managedClub?.name}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, roll, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : filteredMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6">Committee Role</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={m.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.name)}&background=6366f1&color=fff`}
                        alt={m.user.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{m.user.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{m.user.rollNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{m.user.department}</td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="CORE_MEMBER">CORE MEMBER</option>
                        <option value="SECRETARY">SECRETARY</option>
                        <option value="COORDINATOR">COORDINATOR</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleRemoveMember(m.id, m.user.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">No members matching search query.</div>
        )}
      </div>
    </div>
  );
};
