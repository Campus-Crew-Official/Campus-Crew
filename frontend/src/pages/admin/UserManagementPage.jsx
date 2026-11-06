import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Users, Search, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';

const ROLES = ['ALL', 'STUDENT', 'COORDINATOR', 'ADMIN'];

export const UserManagementPage = () => {
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', selectedRole, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRole !== 'ALL') params.append('role', selectedRole);
      if (search) params.append('search', search);
      const res = await api.get(`/users?${params.toString()}`);
      return res;
    },
  });

  const users = usersData?.data || [];

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Set status of ${user.name} to ${nextStatus}?`)) return;

    try {
      await api.patch(`/users/${user.id}/status`, { status: nextStatus });
      addToast(`User ${user.name} is now ${nextStatus}`, 'info');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRoleChange = async (userId, userName, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      addToast(`Updated ${userName} role to ${newRole}`, 'success');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student & Staff Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Account governance, credential permissions, and suspension controls
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, roll, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-2">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRole === role
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Department & Year</th>
                  <th className="py-3.5 px-6">Platform Role</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`}
                        alt={u.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {u.department} (Yr {u.year}) • {u.rollNumber}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, u.name, e.target.value)}
                        className="py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="COORDINATOR">COORDINATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={u.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No users found"
            description="No student or staff accounts matching your current search parameters."
          />
        )}
      </div>
    </div>
  );
};
