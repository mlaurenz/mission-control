// app/agents/page.tsx - Agents Page
import { getSessions, getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  let health = { status: 'unknown', timestamp: '' };
  let sessions = { sessions: [] };

  try { health = await getHealth(); } catch (e) {}
  try { sessions = await getSessions(); } catch (e) {}

  // Sort sessions: active first, then by recency
  const sortedSessions = [...(sessions.sessions || [])].sort((a: any, b: any) => {
    const aActive = a.last_active?.toLowerCase().includes('now') || a.last_active?.toLowerCase().includes('m ago');
    const bActive = b.last_active?.toLowerCase().includes('now') || b.last_active?.toLowerCase().includes('m ago');
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return 0;
  });

  const sessionCount = sortedSessions.length;
  const activeNow = sortedSessions.filter((s: any) => 
    s.last_active?.toLowerCase().includes('now') || s.last_active?.toLowerCase().includes('m ago')
  );

  return (
    <main style={{ color: '#e0e0e0' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>🤖 Agents & Sessions</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.85rem' }}>
          Recent activity → oldest (most recent first)
        </p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{sessionCount}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Active Now</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#4ade80' }}>{activeNow.length}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Gateway</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', color: health.status === 'healthy' ? '#4ade80' : '#f87171' }}>
            {health.status === 'healthy' ? '🟢' : '🔴'}
          </p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Model</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', color: '#60a5fa' }}>MiniMax-M2</p>
        </div>
      </div>

      {/* Sessions: Most Recent First */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#fff', margin: 0 }}>Recent Sessions</h2>
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Most recent ↑</span>
      </div>
      
      {sessionCount > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sortedSessions.map((s: any, i: number) => {
            const isActive = s.last_active?.toLowerCase().includes('now') || s.last_active?.toLowerCase().includes('m ago');
            return (
              <div key={i} style={{ 
                background: '#141414', 
                borderRadius: '6px', 
                border: '1px solid #333',
                padding: '0.875rem 1rem',
                borderLeft: isActive ? '3px solid #4ade80' : i === 0 ? '3px solid #60a5fa' : '3px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ 
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isActive ? '#4ade80' : '#666'
                  }}/>
                  <div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{s.title || 'Untitled'}</div>
                    <div style={{ color: '#666', fontSize: '0.75rem' }}>{s.workspace}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: isActive ? '#4ade80' : '#888', fontSize: '0.8rem' }}>
                    {s.last_active || 'N/A'}
                  </div>
                  {i === 0 && <div style={{ color: '#60a5fa', fontSize: '0.65rem' }}>← NEWEST</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333', padding: '3rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>No sessions</p>
        </div>
      )}
    </main>
  );
}
