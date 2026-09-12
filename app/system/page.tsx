// app/system/page.tsx - System Page
import { getHealth, getGatewayStatus, getMCP } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function SystemPage() {
  let health = { status: 'unknown', timestamp: '' };
  let gateway = { processes: 0, uptime: '' };
  let mcp = { servers: [] };

  try { health = await getHealth(); } catch (e) {}
  try { gateway = await getGatewayStatus(); } catch (e) {}
  try { mcp = await getMCP(); } catch (e) {}

  return (
    <main style={{ color: '#e0e0e0' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>⚙️ System</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.85rem' }}>
          Hermes system status and health
        </p>
      </header>

      {/* Health Status */}
      <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333', padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ 
            fontSize: '2rem',
            color: health.status === 'healthy' ? '#4ade80' : '#f87171'
          }}>
            {health.status === 'healthy' ? '🟢' : '🔴'}
          </span>
          <div>
            <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>Hermes Gateway</div>
            <div style={{ color: '#666', fontSize: '0.85rem' }}>Status: {health.status || 'unknown'}</div>
          </div>
        </div>
        {health.timestamp && (
          <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.8rem' }}>
            Last update: {health.timestamp}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Processes</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{gateway.processes || 0}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>MCP Servers</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{(mcp.servers || []).length}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Model</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', color: '#60a5fa' }}>MiniMax-M2</p>
        </div>
      </div>

      {/* MCP Servers */}
      <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>🔌 MCP Servers</h2>
        </div>
        {(mcp.servers && mcp.servers.length > 0) ? (
          <div style={{ padding: '0.5rem' }}>
            {mcp.servers.map((server: any, i: number) => (
              <div key={i} style={{ padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '0.25rem', background: '#1a1a1a' }}>
                <div style={{ color: '#fff', fontSize: '0.9rem' }}>{server.name || server}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No MCP servers</p>
        )}
      </div>
    </main>
  );
}
