import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Users, Calendar, ArrowRight, Shield } from 'lucide-react';

export const MyClubsPage = () => {
  const { user } = useAuth();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['my-profile-clubs'],
    queryFn: () => api.get('/auth/me'),
  });

  const memberships = userData?.data?.clubMemberships || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Club Memberships</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active organizations and core committee affiliations
          </p>
        </div>

        <Link
          to="/clubs"
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Users className="w-4 h-4" /> Discover More Clubs
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : memberships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberships.map((m) => (
            <div
              key={m.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={m.club.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.club.name)}&background=6366f1&color=fff`}
                    alt={m.club.name}
                    className="w-12 h-12 rounded-2xl object-cover bg-slate-50 border border-slate-200 shadow-sm"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{m.club.name}</h3>
                    <Badge variant={m.club.category} className="mt-1" />
                  </div>
                </div>
                <Badge variant={m.role} />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Member since {new Date(m.joinedAt).toLocaleDateString()}</span>
                <Link
                  to={`/clubs/${m.club.slug}`}
                  className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  Club Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No club memberships yet"
          description="Browse campus clubs and join organizations that align with your technical and cultural interests."
          action={
            <Link
              to="/clubs"
              className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
            >
              Explore Clubs
            </Link>
          }
        />
      )}
    </div>
  );
};
