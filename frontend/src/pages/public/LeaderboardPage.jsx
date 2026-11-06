import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Award, Trophy, Medal, Star, ShieldCheck, Filter } from 'lucide-react';

const CATEGORIES = ['ALL', 'VOLUNTEER_WORK', 'TASK_COMPLETION', 'COORDINATION'];

export const LeaderboardPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      const res = await api.get(`/contributions/leaderboard?${params.toString()}`);
      return res.data;
    },
  });

  const topThree = leaderboard?.slice(0, 3) || [];
  const remaining = leaderboard?.slice(3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span>Campus Contribution Recognition</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Volunteer & Member Honor Roll
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Points are awarded strictly for coordinator-verified volunteer activities and completed tasks.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : leaderboard?.length > 0 ? (
        <div className="space-y-8">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
            {/* Rank 2 - Silver */}
            {topThree[1] && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md text-center space-y-3 order-2 md:order-1 card-hover">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto font-black text-lg border-2 border-slate-300">
                  2
                </div>
                <img
                  src={topThree[1].user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[1].user?.name)}&background=94a3b8&color=fff`}
                  alt={topThree[1].user?.name}
                  className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-white shadow"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm truncate">{topThree[1].user?.name}</h4>
                  <p className="text-[11px] text-slate-400">{topThree[1].user?.department}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-lg text-slate-800">{topThree[1].totalPoints}</span>
                  <span className="text-[10px] text-slate-400 block">Verified Points</span>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold */}
            {topThree[0] && (
              <div className="bg-gradient-to-b from-amber-50 to-white p-8 rounded-3xl border-2 border-amber-300 shadow-xl text-center space-y-4 order-1 md:order-2 card-hover md:-translate-y-4">
                <div className="w-14 h-14 rounded-full bg-amber-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-400/40 font-black text-xl">
                  👑
                </div>
                <img
                  src={topThree[0].user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[0].user?.name)}&background=f59e0b&color=fff`}
                  alt={topThree[0].user?.name}
                  className="w-20 h-20 rounded-2xl object-cover mx-auto border-4 border-amber-200 shadow-md"
                />
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                    CAMPUS CHAMPION
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-1.5 truncate">{topThree[0].user?.name}</h3>
                  <p className="text-xs text-slate-500">{topThree[0].user?.rollNumber} • {topThree[0].user?.department}</p>
                </div>
                <div className="pt-3 border-t border-amber-100">
                  <span className="font-black text-2xl text-amber-600">{topThree[0].totalPoints}</span>
                  <span className="text-xs text-slate-400 block font-semibold">Total Verified Points</span>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {topThree[2] && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md text-center space-y-3 order-3 card-hover">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-black text-lg border-2 border-amber-300">
                  3
                </div>
                <img
                  src={topThree[2].user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[2].user?.name)}&background=d97706&color=fff`}
                  alt={topThree[2].user?.name}
                  className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-white shadow"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm truncate">{topThree[2].user?.name}</h4>
                  <p className="text-[11px] text-slate-400">{topThree[2].user?.department}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-lg text-slate-800">{topThree[2].totalPoints}</span>
                  <span className="text-[10px] text-slate-400 block">Verified Points</span>
                </div>
              </div>
            )}
          </div>

          {/* Full Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">Complete Standings</h3>
              <span className="text-xs text-slate-400 font-medium">Updated in real-time</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/30">
                    <th className="py-3 px-6">Rank</th>
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-6">Department</th>
                    <th className="py-3 px-6">Year</th>
                    <th className="py-3 px-6 text-right">Contributions</th>
                    <th className="py-3 px-6 text-right">Verified Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {leaderboard.map((item) => (
                    <tr key={item.user?.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-700">
                        {item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : `#${item.rank}`}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-3">
                        <img
                          src={item.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name)}&background=6366f1&color=fff`}
                          alt={item.user?.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <span>{item.user?.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{item.user?.rollNumber}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{item.user?.department}</td>
                      <td className="py-3.5 px-6 text-slate-600">Year {item.user?.year}</td>
                      <td className="py-3.5 px-6 text-right font-medium text-slate-600">{item.contributionsCount}</td>
                      <td className="py-3.5 px-6 text-right font-black text-brand-600 text-sm">
                        {item.totalPoints} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No verified points yet"
          description="Complete volunteer tasks and earn verified contributions to appear on the honor roll."
        />
      )}
    </div>
  );
};
