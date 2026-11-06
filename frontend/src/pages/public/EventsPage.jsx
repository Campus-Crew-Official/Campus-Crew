import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar, Search, MapPin, Users, ArrowRight, Clock } from 'lucide-react';

const EVENT_CATEGORIES = ['ALL', 'HACKATHON', 'WORKSHOP', 'COMPETITION', 'CULTURAL_FEST', 'SPORTS', 'MEETUP'];

export const EventsPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['events', selectedCategory, search, upcomingOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (search) params.append('search', search);
      if (upcomingOnly) params.append('upcoming', 'true');
      const res = await api.get(`/events?${params.toString()}`);
      return res;
    },
  });

  const events = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campus Events & Hackathons</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore upcoming collegiate workshops, festivals, and competitions with real-time seat tracking
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search events or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const seatsRemaining = Math.max(0, evt.maxCapacity - evt.registeredCount);
            const isFull = seatsRemaining === 0;
            const percentFilled = Math.min(100, Math.round((evt.registeredCount / evt.maxCapacity) * 100));

            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col card-hover"
              >
                {/* Banner */}
                <div className="h-44 bg-slate-900 relative overflow-hidden">
                  <img
                    src={evt.bannerUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600'}
                    alt={evt.title}
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={evt.category} />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={evt.status} />
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                      {evt.club?.name}
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 mt-1 line-clamp-1">{evt.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  {/* Date, Venue, Capacity */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{new Date(evt.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(evt.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center text-[11px] mb-1 font-semibold">
                        <span className="text-slate-500">Seat Capacity</span>
                        <span className={isFull ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {isFull ? 'Sold Out' : `${seatsRemaining} seats left`}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFull ? 'bg-rose-500' : percentFilled > 80 ? 'bg-amber-500' : 'bg-brand-600'
                          }`}
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/events/${evt.slug}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-98"
                  >
                    <span>View Event & Register</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No events scheduled"
          description="Check back soon for upcoming campus hackathons and workshops."
        />
      )}
    </div>
  );
};
