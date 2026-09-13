'use client';
export const dynamic = 'force-dynamic';
// app/agents/page.tsx - Agents & Costs, fully dynamic + auto-refresh
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { timeAgo, getMcpStatus } from '../../lib/utils/time';

interface AgentsData {
  health: any;
  mcp: any;
  profiles: any;
  config: any;
}

export default function AgentsPage() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const activeTab = params?.get('tab') || 'agents';

  const { data, loading, lastUpdated, refetch } = useAutoRefresh<AgentsData>({
    url: '/api/agents',
    interval: 10000,
  });

  const health = data?.health || { status: 'unknown' };
  const mcpServers = data?.mcp?.servers || [];
  const profiles = data?.profiles?.profiles || [];
  const config = data?.config || {};

  // Active model from bridge config
  const activeModel = config?.model || config?.active_model || profiles.find((p: any) => p.status === 'active')?.model || '—';
  const activeProvider = config?.provider || '—';

  // Build cost table dynamically from profiles
  const modelMap = new Map<string, { model: string; agents: string[] }>();
  profiles.forEach((p: any) => {
    const model = p.model || 'unknown';
    if (!modelMap.has(model)) modelMap.set(model, { model, agents: [] });
    modelMap.get(model)!.agents.push(p.name);
  });
  const modelGroups = Array.from(modelMap.values());

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Agents"
        icon="🤖"
        subtitle="Modelos, agentes MCP y profiles"
        status={health.status === 'healthy' ? 'online' : 'offline'}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b-2 border-gray-200">
        {[
          { key: 'agents', label: '🤖 Agentes' },
          { key: 'costs', label: '💰 Modelos' },
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
                  <span className="text-xl font-bold text-green-800">{activeModel}</span>
                </div>
                <p className="text-green-700 text-sm mt-1">{activeProvider}</p>
              </div>
              <span className="px-4 py-2 bg-green-800 text-white rounded-lg font-semibold text-sm">ACTIVO</span>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-xs text-gray-500 uppercase font-semibold mb-3">
              MCP Agents ({mcpServers.length})
            </h2>
            {mcpServers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mcpServers.map((agent: any, i: number) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${agent.enabled !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-base font-semibold text-gray-900">{agent.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        agent.enabled !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {agent.enabled !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      {agent.tools && <div><span className="font-semibold">Tools:</span> {typeof agent.tools === 'string' ? agent.tools : JSON.stringify(agent.tools)}</div>}
                      {agent.transport && <div className="break-all"><span className="font-semibold">Transport:</span> {typeof agent.transport === 'string' ? agent.transport : JSON.stringify(agent.transport)}</div>}
                      {agent.type && <div><span className="font-semibold">Type:</span> {agent.type}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-400">No MCP agents data from bridge</p>
              </div>
            )}
          </section>

          {/* Profiles */}
          <section>
            <h2 className="text-xs text-gray-500 uppercase font-semibold mb-3">
              Profiles ({profiles.length})
            </h2>
            {profiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {profiles.map((p: any, i: number) => (
                  <div key={i} className={`p-3 rounded-lg ${p.status === 'active' ? 'bg-green-50 border-2 border-green-400' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-sm font-semibold ${p.status === 'active' ? 'text-green-700' : 'text-gray-700'}`}>
                        {p.status === 'active' ? '●' : '○'} {p.name}
                      </span>
                    </div>
                    {p.model && <span className="text-xs text-gray-500">{p.model}</span>}
                    {p.provider && <span className="text-xs text-gray-400 ml-1">({p.provider})</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-400">No profiles data from bridge</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* MODELS TAB */}
      {activeTab === 'costs' && (
        <>
          <section className="mb-6">
            <h2 className="text-xs text-gray-500 uppercase font-semibold mb-3">Modelos en uso (por profiles)</h2>
            {modelGroups.length > 0 ? (
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-900 text-white">
                        <th className="p-3 text-left font-semibold text-sm">Modelo</th>
                        <th className="p-3 text-center font-semibold text-sm">Profiles</th>
                        <th className="p-3 text-left font-semibold text-sm">Agentes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelGroups.map((row, i) => (
                        <tr key={i} className={`border-b border-gray-200 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="p-3 font-bold text-gray-900">{row.model}</td>
                          <td className="p-3 text-center font-semibold text-gray-600">{row.agents.length}</td>
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
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-400">No model data from bridge — profiles endpoint may not be available</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
