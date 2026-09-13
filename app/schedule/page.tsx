'use client';
export const dynamic = 'force-dynamic';
// app/schedule/page.tsx - Schedule with auto-refresh
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';

interface ScheduleData {
  cron: any;
  health: any;
}

export default function SchedulePage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<ScheduleData>({
    url: '/api/schedule',
    interval: 15000,
  });

  const health = data?.health || { status: 'unknown' };
  const cronJobs = data?.cron?.cron_jobs || [];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle={`${cronJobs.length} scheduled jobs`}
        status={health?.status === 'healthy' ? 'online' : 'offline'}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {cronJobs.length > 0 ? (
        <div className="space-y-3">
          {cronJobs.map((job: any, i: number) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{job.name || 'Unnamed Job'}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {job.status || 'unknown'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                <div><span className="text-xs text-gray-400 uppercase">Schedule:</span> {job.schedule || 'N/A'}</div>
                <div><span className="text-xs text-gray-400 uppercase">Next run:</span> {job.next_run || 'N/A'}</div>
                <div><span className="text-xs text-gray-400 uppercase">Last run:</span> {job.last_run || 'N/A'}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm mb-1">No scheduled jobs</p>
          <p className="text-gray-400 text-xs">Cron jobs configured in Hermes will appear here.</p>
        </div>
      )}
    </div>
  );
}
