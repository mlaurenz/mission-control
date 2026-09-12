// app/agents/page.tsx - Agents Page
import { getSessions, getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  let health = { status: 'unknown', timestamp: '' };
  let sessions = { sessions: [] };

  try { health = await getHealth(); } catch (e) {}
  try { sessions = await getSessions(); } catch (e) {}

  const sessionCount = sessions.sessions?.length || 0;
  const activeNow = sessions.sessions?.filter((s: any) => s.last_active?.includes('Now') || s.last_active?.includes('m')) || [];

  return (
    <main style={{ color: '#e0e0e0' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>🤖 Agents & Sessions</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.85rem' }}>
          Manage and monitor Hermes agents
        </p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Sessions</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{sessionCount}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Active Now</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#4ade80' }}>{activeNow.length}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Gateway Status</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: health.status === 'healthy' ? '#4ade80' : '#f87171' }}>
            {health.status === 'healthy' ? '🟢 Online' : '🔴 Offline'}
          </p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Model</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', color: '#60a5fa' }}>MiniMax-M2</p>
        </div>
      </div>

      {/* Session Cards Grid */}
      <h2 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>Recent Sessions</h2>
      
      {sessionCount > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {sessions.sessions?.map((s: any, i: number) => {
            const isActive = s.last_active?.toLowerCase().includes('now') || s.last_active?.toLowerCase().includes('m ago');
            return (
              <div key={i} style={{ 
                background: '#141414', 
                borderRadius: '8px', 
                border: '1px solid #333',
                padding: '1rem',
                borderLeft: isActive ? '3px solid #4ade80' : '3px solid #333'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>{s.title || 'Untitled'}</h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#666' }}>{s.workspace}</p>
                  </div>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.7rem',
                    background: isActive ? '#1a3a1a' : '#1a1a3a',
                    color: isActive ? '#4ade80' : '#7a7aff'
                  }}>
                    {isActive ? '● Active' : '○ Idle'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                  <span>Last active: {s.last_active || 'N/A'}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333', padding: '3rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>No sessions found</p>
          <p style={{ margin: '0.5rem 0 0', color: '#444', fontSize: '0.85rem' }}>Start a new conversation to create a session</p>
        </div>
      )}
    </main>
  );
}
