// app/sessions/page.tsx - Sessions Page (Clean Style)
import { getSessions, getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function SessionsPage() {
  let health = { status: 'unknown', timestamp: '' };
  let sessions = { sessions: [] };

  try { health = await getHealth(); } catch (e) {}
  try { sessions = await getSessions(); } catch (e) {}

  const sortedSessions = [...(sessions.sessions || [])].sort((a: any, b: any) => {
    const aActive = a.last_active?.toLowerCase().includes('now') || a.last_active?.toLowerCase().includes('m ago');
    const bActive = b.last_active?.toLowerCase().includes('now') || b.last_active?.toLowerCase().includes('m ago');
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return 0;
  });

  const activeCount = sortedSessions.filter((s: any) => 
    s.last_active?.toLowerCase().includes('now') || s.last_active?.toLowerCase().includes('m ago')
  ).length;

  return (
    <main style={{ color: '#1a1a1a', background: '#ffffff' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>💬 Sessions</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>
          Recent conversations and their activity
        </p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>{sortedSessions.length}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Now</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#16a34a', fontWeight: 600 }}>{activeCount}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gateway</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem' }}>
            {health.status === 'healthy' ? '🟢' : '🔴'}
          </p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', color: '#2563eb', fontWeight: 500 }}>MiniMax-M2</p>
        </div>
      </div>

      {/* Sessions Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', margin: 0, fontWeight: 600 }}>Recent Sessions</h2>
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Most recent ↑</span>
      </div>
      
      <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
        {sortedSessions.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#666', fontWeight: 500, fontSize: '0.8rem' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#666', fontWeight: 500, fontSize: '0.8rem' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#666', fontWeight: 500, fontSize: '0.8rem' }}>Workspace</th>
                <th style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#666', fontWeight: 500, fontSize: '0.8rem' }}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {sortedSessions.map((s: any, i: number) => {
                const isActive = s.last_active?.toLowerCase().includes('now') || s.last_active?.toLowerCase().includes('m ago');
                return (
                  <tr key={i} style={{ borderBottom: i < sortedSessions.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td style={{ padding: '0.875rem 1rem', width: '100px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: isActive ? '#dcfce7' : '#f3f4f6',
                        color: isActive ? '#16a34a' : '#6b7280'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#16a34a' : '#6b7280' }}/>
                        {isActive ? 'Active' : 'Idle'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontWeight: 500 }}>{s.title || 'Untitled'}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#666' }}>{s.workspace}</td>
                    <td style={{ textAlign: 'right', padding: '0.875rem 1rem', color: isActive ? '#16a34a' : '#666', fontSize: '0.85rem' }}>{s.last_active || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#666' }}>No sessions found</p>
          </div>
        )}
      </div>
    </main>
  );
}
