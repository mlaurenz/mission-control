'use client';
export const dynamic = 'force-dynamic';
// app/sessions/page.tsx - Sessions with auto-refresh
import PageHeader from '../components/PageHeader';
import OfflineBanner from '../components/OfflineBanner';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { timeAgo } from '../../lib/utils/time';

interface SessionsData {
  sessions: any;
  health: any;
}

export default function SessionsPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<SessionsData>({
    url: '/api/sessions',
    interval: 10000,
  });

  const health = data?.health || { status: 'unknown' };
  const sessionsList = data?.sessions?.sessions || [];
  const isOffline = data && !data.sessions;

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
        title="Sessions"
        subtitle={isOffline ? 'Bridge offline' : `${sessionsList.length} sessions`}
        status={health?.status === 'healthy' ? 'online' : 'offline'}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {isOffline ? (
        <OfflineBanner message="Sessions are not available" />
      ) : sessionsList.length > 0 ? (
        <div className="space-y-2">
          {sessionsList.map((s: any, i: number) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{s.title || 'Untitled Session'}</div>
                  {s.workspace && (
                    <div className="text-xs text-gray-400 font-mono mt-1 truncate">{s.workspace}</div>
                  )}
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap ml-3">
                  {timeAgo(s.last_active)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
          <p className="text-gray-400">No active sessions</p>
        </div>
      )}
    </div>
  );
}
