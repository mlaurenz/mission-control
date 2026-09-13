// app/sessions/page.tsx - Sessions Page
import { getSessions, getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function SessionsPage() {
  const sessions = await getSessions();
  const health = await getHealth();
  
  const sessionsList = sessions?.sessions || [];
  const isOffline = !sessions;

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>💬 Sessions</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>
              {isOffline ? '⚠️ Bridge offline' : 'Sesiones activas y recientes'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '6px',
              background: health?.status === 'healthy' ? '#dcfce7' : '#fee2e2',
              color: health?.status === 'healthy' ? '#166534' : '#dc2626',
              fontSize: '0.85rem', fontWeight: 600
            }}>
              {health?.status === 'healthy' ? '● Online' : '● Offline'}
            </span>
          </div>
        </div>
      </header>

      {isOffline ? (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            ⚠️ <strong>Bridge offline</strong> — Las sesiones no están disponibles
          </p>
        </div>
      ) : sessionsList.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {sessionsList.map((s: any, i: number) => (
            <div key={i} style={{
              background: '#fafafa', padding: '1.25rem', borderRadius: '8px',
              border: '1px solid #e5e5e5'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{s.title || 'Untitled Session'}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Workspace: {s.workspace || 'N/A'} • Last active: {s.last_active || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fafafa', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: '#666', margin: 0 }}>No hay sesiones activas</p>
        </div>
      )}
    </main>
  );
}
