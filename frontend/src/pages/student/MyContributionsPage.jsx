import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Award, ShieldCheck, CheckCircle2, Calendar, Star } from 'lucide-react';

export const MyContributionsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-contributions-full'],
    queryFn: () => api.get('/contributions/my-history'),
  });

  const totalPoints = data?.data?.totalPoints || 0;
  const totalContributions = data?.data?.totalContributions || 0;
  const history = data?.data?.history || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contribution Points & Honor History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete verified audit log of points awarded by club coordinators for your volunteer impact
        </p>
      </div>

      {/* Summary Scorecard */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-300 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verifiable Ledger Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white">{totalPoints}</span>
              <span className="text-lg text-brand-300 font-bold">Total Earned Points</span>
            </div>
            <p className="text-xs text-slate-300">
              Across {totalContributions} verified activities and completed task milestones.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center sm:text-right shrink-0">
            <span className="text-xs text-slate-300 block">Verified Status</span>
            <span className="text-sm font-extrabold text-emerald-300 flex items-center gap-1 justify-center sm:justify-end mt-0.5">
              <CheckCircle2 className="w-4 h-4" /> Good Standing
            </span>
          </div>
        </div>
      </div>

      {/* Audit History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-800">Point Award History</h3>
          <span className="text-xs text-slate-400">{history.length} Transactions</span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/30">
                  <th className="py-3 px-6">Points</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Reason / Milestone</th>
                  <th className="py-3 px-6">Club / Event</th>
                  <th className="py-3 px-6">Verified By</th>
                  <th className="py-3 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 font-black text-brand-600 text-sm">
                      +{item.points} pts
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge variant={item.category} />
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{item.reason}</td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {item.event?.title || item.club?.name || 'Campus Activity'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">{item.verifier?.name || 'Coordinator'}</td>
                    <td className="py-3.5 px-6 text-right text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No contribution points recorded"
            description="Complete volunteer tasks and attend verified activities to earn contribution points."
          />
        )}
      </div>
    </div>
  );
};
