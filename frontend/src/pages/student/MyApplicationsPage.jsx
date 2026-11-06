import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Briefcase, Clock, FileText, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';

export const MyApplicationsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-recruitment-applications'],
    queryFn: () => api.get('/recruitment/my-applications'),
  });

  const applications = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruitment Applications</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track the status of your applications for club core teams, committees, and societies
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 card-hover"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 font-bold shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {app.drive.club?.name}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900">{app.drive.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge variant={app.status} />
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  <strong className="text-slate-700">Statement of Purpose:</strong>
                  <p className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed text-slate-700">
                    {app.statementOfPurpose}
                  </p>
                </div>

                {app.experience && (
                  <div>
                    <strong className="text-slate-700">Experience / Skills:</strong>
                    <p className="mt-0.5 text-slate-500">{app.experience}</p>
                  </div>
                )}

                {app.portfolioUrl && (
                  <div className="pt-1">
                    <a
                      href={app.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Submitted Portfolio Link
                    </a>
                  </div>
                )}
              </div>

              {/* Reviewer Feedback Notes */}
              {app.reviewNotes && (
                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-800">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Committee Feedback & Status Notes:
                  </span>
                  <p className="leading-relaxed">{app.reviewNotes}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </span>
                <Link
                  to={`/clubs/${app.drive.club?.slug}`}
                  className="font-bold text-slate-600 hover:text-brand-600"
                >
                  Visit Club Page →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recruitment applications"
          description="You haven't submitted applications for club core committee positions yet."
        />
      )}
    </div>
  );
};
