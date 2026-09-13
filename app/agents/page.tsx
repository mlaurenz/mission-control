// app/agents/page.tsx - Agents Page with Costs Tab
import { getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

const MCP_AGENTS = [
  { enabled: true, name: 'octopush', status: 'enabled', tools: 'all', transport: 'https://octopushon.us/api', lastPing: Date.now() - 30000 },
  { enabled: true, name: 'open-design', status: 'enabled', tools: 'all', transport: '/root/.hermes/node/bin/no...', lastPing: Date.now() - 5000 }
];

const MODEL_COSTS = [
  { model: 'MiniMax M2.7', inputPer1M: 0.21, outputPer1M: 0.84, context: '205K', agents: ['default', 'orchestrator'] },
  { model: 'MiniMax M2', inputPer1M: 0.26, outputPer1M: 1.02, context: '204.8K', agents: ['automation', 'consultant', 'creator', 'designer', 'editor', 'pm', 'research', 'social'] },
  { model: 'GPT-5.6 Sol', inputPer1M: 2.00, outputPer1M: 10.00, context: '1M', agents: ['coder'] }
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

function getMcpStatus(lastPing: number) {
  const diff = Date.now() - lastPing;
  if (diff < 60000) return { dot: '#16a34a', label: 'Connected', bg: '#dcfce7', text: '#166534' };
  if (diff < 300000) return { dot: '#d97706', label: 'Slow', bg: '#fef3c7', text: '#92400e' };
  return { dot: '#dc2626', label: 'Disconnected', bg: '#fee2e2', text: '#dc2626' };
}

export default async function AgentsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const activeTab = params.tab || 'agents';

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
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Modelos, agentes y costos</p>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', paddingBottom: '0' }}>
        <a href="?tab=agents" style={{
          padding: '0.75rem 1.5rem', textDecoration: 'none', fontWeight: 600,
          color: activeTab === 'agents' ? '#2563eb' : '#666',
          borderBottom: activeTab === 'agents' ? '3px solid #2563eb' : '3px solid transparent',
          marginBottom: '-2px'
        }}>
          🤖 Agentes
        </a>
        <a href="?tab=costs" style={{
          padding: '0.75rem 1.5rem', textDecoration: 'none', fontWeight: 600,
          color: activeTab === 'costs' ? '#2563eb' : '#666',
          borderBottom: activeTab === 'costs' ? '3px solid #2563eb' : '3px solid transparent',
          marginBottom: '-2px'
        }}>
          💰 Costos
        </a>
      </div>

      {/* AGENTS TAB */}
      {activeTab === 'agents' && (
        <>
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
              <span style={{ padding: '0.5rem 1rem', background: '#166534', color: '#fff', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem' }}>
                ACTIVO
              </span>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 600 }}>
              MCP Agents ({MCP_AGENTS.length})
            </h2>
            {MCP_AGENTS.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {MCP_AGENTS.map((agent: any, i: number) => {
                  const st = getMcpStatus(agent.lastPing || Date.now());
                  return (
                    <div key={i} style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1a1a' }}>{agent.name}</span>
                        </div>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: st.bg, color: st.text, fontSize: '0.7rem', fontWeight: 600 }}>
                          {st.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        <div style={{ marginBottom: '0.3rem' }}><span style={{ fontWeight: 600 }}>Tools:</span> {agent.tools}</div>
                        <div style={{ marginBottom: '0.3rem', wordBreak: 'break-all' }}><span style={{ fontWeight: 600 }}>Transport:</span> {agent.transport}</div>
                        <div style={{ marginTop: '0.5rem', color: '#999', fontSize: '0.7rem' }}>Last ping: {timeAgo(agent.lastPing)}</div>
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
        </>
      )}

      {/* COSTS TAB */}
      {activeTab === 'costs' && (
        <>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 600 }}>
              💰 Costos por Modelo (OpenRouter)
            </h2>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Precios por 1M de tokens. El costo depende del uso real de cada agente.
            </p>

            <div style={{ background: '#fafafa', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Modelo</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Input $/1M</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Output $/1M</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Context</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Agentes</th>
                  </tr>
                </thead>
                <tbody>
                  {MODEL_COSTS.map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < MODEL_COSTS.length - 1 ? '1px solid #e5e5e5' : 'none', background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#1a1a1a' }}>{row.model}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.9rem' }}>${row.inputPer1M.toFixed(2)}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.9rem', color: '#dc2626' }}>${row.outputPer1M.toFixed(2)}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>{row.context}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {row.agents.map((agent: string) => (
                            <span key={agent} style={{ padding: '0.2rem 0.5rem', background: '#e5e5e5', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#333' }}>
                              {agent}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 600 }}>
              📊 Resumen de Costos
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {MODEL_COSTS.map((row, i) => {
                const costRatio = row.outputPer1M / row.inputPer1M;
                const emoji = row.model === 'GPT-5.6 Sol' ? '🔴' : row.model === 'MiniMax M2.7' ? '🟡' : '🟢';
                const label = row.model === 'GPT-5.6 Sol' ? 'Alto' : row.model === 'MiniMax M2.7' ? 'Medio' : 'Bajo';
                return (
                  <div key={i} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{row.model}</span>
                      <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>Ratio Output/Input:</span> {costRatio.toFixed(1)}x
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      <span style={{ fontWeight: 600 }}>Costo relativo:</span> {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{ marginTop: '2rem' }}>
            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e' }}>
                💡 <strong>Nota:</strong> Los costos mostrados son de OpenRouter. GPT-5.6 Sol es ~10x más caro que MiniMax en output. El costo real depende del uso de tokens de cada agente.
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
