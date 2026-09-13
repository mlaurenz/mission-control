// app/sessions/page.tsx - Sessions Page with Tailwind
import { getSessions, getHealth } from '../../lib/connectors/HermesConnector';
import PageHeader from '../components/PageHeader';
import OfflineBanner from '../components/OfflineBanner';

export const dynamic = 'force-dynamic';

export default async function SessionsPage() {
  const sessions = await getSessions();
  const health = await getHealth();
  
  const sessionsList = sessions?.sessions || [];
  const isOffline = !sessions;

  return (
    <div>
      <PageHeader
        title="Sessions"
        icon="💬"
        subtitle={isOffline ? '⚠️ Bridge offline' : 'Sesiones activas y recientes'}
        status={health?.status === 'healthy' ? 'online' : 'offline'}
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
