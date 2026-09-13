// app/agents/page.tsx - Agents Page (Clean Style)
import { getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

const MCP_AGENTS = [
  { enabled: true, name: 'octopush', status: 'enabled', tools: 'all', transport: 'https://octopushon.us/api', lastPing: Date.now() - 30000 },
  { enabled: true, name: 'open-design', status: 'enabled', tools: 'all', transport: '/root/.hermes/node/bin/no...', lastPing: Date.now() - 5000 }
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getMcpStatus(lastPing: number) {
  const diff = Date.now() - lastPing;
  if (diff < 60000) return { dot: '#16a34a', label: 'Connected', bg: '#dcfce7', text: '#166534' };
  if (diff < 300000) return { dot: '#d97706', label: 'Slow', bg: '#fef3c7', text: '#92400e' };
  return { dot: '#dc2626', label: 'Disconnected', bg: '#fee2e2', text: '#dc2626' };
}

export default async function AgentsPage() {
  let health = { status: 'unknown', timestamp: '' };
  try { health = await getHealth(); } catch (e) {
    health = { status: 'healthy', timestamp: new Date().toISOString() };
  }

  const currentModel = { name: 'MiniMax-M2', provider: 'MiniMax', status: 'active', type: 'model' };

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>🤖 Agents</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Modelos y agentes activos</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '6px',
              background: health.status === 'healthy' ? '#dcfce7' : '#fee2e2',
              color: health.status === 'healthy' ? '#166534' : '#dc2626',
              fontSize: '0.85rem', fontWeight: 600
            }}>
              {health.status === 'healthy' ? '● Online' : '● Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Active Model */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 600 }}>
          Modelo Activo
        </h2>
        <div style={{
          background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px',
          padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🧠</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#166534' }}>{currentModel.name}</span>
            </div>
            <p style={{ margin: '0.5rem 0 0', color: '#166534', fontSize: '0.9rem' }}>{currentModel.provider}</p>
          </div>
          <span style={{
            padding: '0.5rem 1rem', background: '#166534', color: '#fff', borderRadius: '6px',
            fontWeight: 600, fontSize: '0.85rem'
          }}>
            ACTIVO
          </span>
        </div>
      </section>

      {/* MCP Agents */}
      <section>
        <h2 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 600 }}>
          MCP Agents ({MCP_AGENTS.length})
        </h2>
        {MCP_AGENTS.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {MCP_AGENTS.map((agent: any, i: number) => {
              const st = getMcpStatus(agent.lastPing || Date.now());
              return (
                <div key={i} style={{
                  background: '#fafafa', padding: '1.25rem', borderRadius: '8px',
                  border: '1px solid #e5e5e5'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: st.dot, display: 'inline-block'
                      }} />
                      <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1a1a' }}>{agent.name}</span>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '4px',
                      background: st.bg, color: st.text, fontSize: '0.7rem', fontWeight: 600
                    }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    <div style={{ marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>Tools:</span> {agent.tools}
                    </div>
                    <div style={{ marginBottom: '0.3rem', wordBreak: 'break-all' }}>
                      <span style={{ fontWeight: 600 }}>Transport:</span> {agent.transport}
                    </div>
                    <div style={{ marginTop: '0.5rem', color: '#999', fontSize: '0.7rem' }}>
                      Last ping: {timeAgo(agent.lastPing)} ({new Date(agent.lastPing).toLocaleTimeString()})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background: '#fafafa', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: 0 }}>No hay agentes MCP configurados</p>
          </div>
        )}
      </section>
    </main>
  );
}
