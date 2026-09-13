// app/agents/page.tsx - Agents Page with Tailwind
import { getHealth } from '../../lib/connectors/HermesConnector';
import PageHeader from '../components/PageHeader';
import { timeAgo, getMcpStatus } from '../../lib/utils/time';

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

export default async function AgentsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const activeTab = params.tab || 'agents';

  let health = { status: 'unknown', timestamp: '' };
  try { health = await getHealth() || health; } catch {}

  return (
    <div>
      <PageHeader
        title="Agents"
        icon="🤖"
        subtitle="Modelos, agentes y costos"
        status={health.status === 'healthy' ? 'online' : 'offline'}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b-2 border-gray-200">
        {[
          { key: 'agents', label: '🤖 Agentes' },
          { key: 'costs', label: '💰 Costos' },
        ].map(tab => (
          <a key={tab.key} href={`?tab=${tab.key}`}
            className={`px-5 py-3 text-sm font-semibold -mb-[2px] transition-colors no-underline
              ${activeTab === tab.key
                ? 'text-blue-600 border-b-[3px] border-blue-600'
                : 'text-gray-500 border-b-[3px] border-transparent hover:text-gray-700'
              }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* AGENTS TAB */}
      {activeTab === 'agents' && (
        <>
          <section className="mb-6">
            <h2 className="text-xs text-gray-500 uppercase font-semibold mb-3">Modelo Activo</h2>
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  <span className="text-xl font-bold text-green-800">MiniMax-M2</span>
                </div>
                <p className="text-green-700 text-sm mt-1">MiniMax</p>
              </div>
              <span className="px-4 py-2 bg-green-800 text-white rounded-lg font-semibold text-sm">ACTIVO</span>
            </div>
          </section>

          <section>
            <h2 className="text-xs text-gray-500 uppercase font-semibold mb-3">
              MCP Agents ({MCP_AGENTS.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MCP_AGENTS.map((agent, i) => {
                const st = getMcpStatus(agent.lastPing);
                return (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                        <span className="text-base font-semibold text-gray-900">{agent.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div><span className="font-semibold">Tools:</span> {agent.tools}</div>
                      <div className="break-all"><span className="font-semibold">Transport:</span> {agent.transport}</div>
                      <div className="text-gray-400 mt-2">Last ping: {timeAgo(agent.lastPing)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* COSTS TAB */}
      {activeTab === 'costs' && (
        <>
          <section className="mb-6">
            <h2 className="text-xs text-gray-500 uppercase font-semibold mb-2">💰 Costos por Modelo (OpenRouter)</h2>
            <p className="text-gray-500 text-sm mb-4">Precios por 1M de tokens. El costo depende del uso real de cada agente.</p>

            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="p-3 text-left font-semibold text-sm">Modelo</th>
                      <th className="p-3 text-right font-semibold text-sm">Input $/1M</th>
                      <th className="p-3 text-right font-semibold text-sm">Output $/1M</th>
                      <th className="p-3 text-center font-semibold text-sm">Context</th>
                      <th className="p-3 text-left font-semibold text-sm">Agentes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODEL_COSTS.map((row, i) => (
                      <tr key={i} className={`border-b border-gray-200 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="p-3 font-bold text-gray-900">{row.model}</td>
                        <td className="p-3 text-right font-mono text-sm">${row.inputPer1M.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-sm text-red-600">${row.outputPer1M.toFixed(2)}</td>
                        <td className="p-3 text-center text-sm text-gray-500">{row.context}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {row.agents.map(agent => (
                              <span key={agent} className="px-2 py-0.5 bg-gray-200 rounded text-xs font-semibold text-gray-700">{agent}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs text-gray-500 uppercase font-semibold mb-3">📊 Resumen de Costos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MODEL_COSTS.map((row, i) => {
                const costRatio = row.outputPer1M / row.inputPer1M;
                const emoji = row.model === 'GPT-5.6 Sol' ? '🔴' : row.model === 'MiniMax M2.7' ? '🟡' : '🟢';
                const label = row.model === 'GPT-5.6 Sol' ? 'Alto' : row.model === 'MiniMax M2.7' ? 'Medio' : 'Bajo';
                return (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">{row.model}</span>
                      <span className="text-lg">{emoji}</span>
                    </div>
                    <div className="text-sm text-gray-500"><span className="font-semibold">Ratio:</span> {costRatio.toFixed(1)}x</div>
                    <div className="text-sm text-gray-500"><span className="font-semibold">Costo:</span> {label}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-4">
            <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>Nota:</strong> GPT-5.6 Sol es ~10x más caro que MiniMax en output. El costo real depende del uso de tokens.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
