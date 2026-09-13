'use client';
export const dynamic = 'force-dynamic';
// app/sessions/page.tsx - Sessions with auto-refresh
import PageHeader from '../components/PageHeader';
import OfflineBanner from '../components/OfflineBanner';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';

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
        icon="💬"
        subtitle={isOffline ? '⚠️ Bridge offline' : `${sessionsList.length} sesiones`}
        status={health?.status === 'healthy' ? 'online' : 'offline'}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {isOffline ? (
        <OfflineBanner message="Las sesiones no están disponibles" />
      ) : sessionsList.length > 0 ? (
        <div className="space-y-3">
          {sessionsList.map((s: any, i: number) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="font-semibold text-gray-900 mb-1">{s.title || 'Untitled Session'}</div>
              <div className="text-sm text-gray-500">
                Workspace: {s.workspace || 'N/A'} · Last active: {s.last_active || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-xl text-center">
          <p className="text-gray-400">No hay sesiones activas</p>
        </div>
      )}
    </div>
  );
}
