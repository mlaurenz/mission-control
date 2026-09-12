// app/agents/page.tsx - Agents Page (Clean Style)
import { getMCP, getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  let mcp = { servers: [], timestamp: '' };
  let health = { status: 'unknown', timestamp: '' };

  try { mcp = await getMCP(); } catch (e) { console.error('MCP error:', e); }
  try { health = await getHealth(); } catch (e) { console.error('Health error:', e); }

  const agents = mcp.servers || [];
  const lastUpdate = mcp.timestamp ? new Date(mcp.timestamp).toLocaleString() : 'N/A';

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>🤖 MCP Agents</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>
              Model Context Protocol servers connected to Hermes
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              display: 'inline-block', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px', 
              background: health.status === 'healthy' ? '#dcfce7' : '#fee2e2',
              color: health.status === 'healthy' ? '#166534' : '#dc2626',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              {health.status === 'healthy' ? '● Bridge Online' : '● Offline'}
            </span>
            <p style={{ margin: '0.5rem 0 0', color: '#999', fontSize: '0.75rem' }}>Updated: {lastUpdate}</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Agents</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>{agents.length}</p>
        </div>
        <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#16a34a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Enabled</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#16a34a', fontWeight: 700 }}>{agents.filter((a: any) => a.enabled).length}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Model</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.25rem', color: '#2563eb', fontWeight: 600 }}>MiniMax-M2</p>
        </div>
      </div>

      {/* Agents Grid */}
      <section>
        <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Connected Agents</h2>
        {agents.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {agents.map((agent: any, i: number) => (
              <div key={i} style={{ 
                background: '#fafafa', 
                padding: '1.25rem', 
                borderRadius: '8px', 
                border: agent.enabled ? '1px solid #bbf7d0' : '1px solid #fecaca'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1a1a' }}>{agent.name}</span>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    background: agent.enabled ? '#dcfce7' : '#fee2e2',
                    color: agent.enabled ? '#166534' : '#dc2626',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}>
                    {agent.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <p style={{ margin: '0.25rem 0' }}><strong>Transport:</strong> {agent.transport}</p>
                  <p style={{ margin: '0.25rem 0' }}><strong>Tools:</strong> {agent.tools}</p>
                  <p style={{ margin: '0.25rem 0' }}><strong>Status:</strong> {agent.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#fafafa', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: 0 }}>No MCP agents configured</p>
          </div>
        )}
      </section>
    </main>
  );
}
