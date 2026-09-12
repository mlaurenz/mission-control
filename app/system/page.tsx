// app/system/page.tsx - System Page (Clean Style)
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
    <main style={{ color: '#1a1a1a', background: '#ffffff' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>⚙️ System</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Hermes system status and health</p>
      </header>

      {/* Health Status */}
      <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>
            {health.status === 'healthy' ? '🟢' : '🔴'}
          </span>
          <div>
            <div style={{ color: '#1a1a1a', fontSize: '1.25rem', fontWeight: 600 }}>Hermes Gateway</div>
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
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Processes</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>{gateway.processes || 0}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MCP Servers</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>{(mcp.servers || []).length}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', color: '#2563eb', fontWeight: 500 }}>MiniMax-M2</p>
        </div>
      </div>

      {/* MCP Servers */}
      <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e5e5' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', color: '#1a1a1a', fontWeight: 600 }}>🔌 MCP Servers</h2>
        </div>
        {(mcp.servers && mcp.servers.length > 0) ? (
          <div style={{ padding: '0.5rem' }}>
            {mcp.servers.map((server: any, i: number) => (
              <div key={i} style={{ padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '0.25rem', background: '#ffffff', border: '1px solid #e5e5e5' }}>
                <div style={{ color: '#1a1a1a', fontSize: '0.9rem', fontWeight: 500 }}>{server.name || server}</div>
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
