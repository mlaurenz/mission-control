'use client';
export const dynamic = 'force-dynamic';
// app/system/page.tsx - System with auto-refresh, dynamic model
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';

interface SystemData {
  health: any;
  gateway: any;
  mcp: any;
  config: any;
}

export default function SystemPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<SystemData>({
    url: '/api/system',
    interval: 15000,
  });

  const health = data?.health || { status: 'unknown', timestamp: '' };
  const gateway = data?.gateway || { processes: 0, uptime: '' };
  const mcp = data?.mcp || { servers: [] };
  const config = data?.config || {};

  const activeModel = config?.model || config?.active_model || '—';

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
        title="System"
        icon="⚙️"
        subtitle="Hermes system status and health"
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Health status */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{health.status === 'healthy' ? '🟢' : '🔴'}</span>
          <div>
            <div className="text-lg font-semibold text-gray-900">Hermes Gateway</div>
            <div className="text-sm text-gray-500">Status: {health.status || 'unknown'}</div>
          </div>
        </div>
        {health.timestamp && (
          <div className="mt-3 text-sm text-gray-400">Last update: {health.timestamp}</div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Processes</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{gateway.processes || 0}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">MCP Servers</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{(mcp.servers || []).length}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active Model</p>
          <p className="text-lg font-medium text-blue-600 mt-1">{activeModel}</p>
        </div>
      </div>

      {/* Config details if available */}
      {Object.keys(config).length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 mb-4">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">📋 Config</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {Object.entries(config).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="font-semibold text-gray-600 min-w-[120px]">{key}:</span>
                <span className="text-gray-900 break-all">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MCP Servers */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">🔌 MCP Servers</h2>
        </div>
        {mcp.servers?.length > 0 ? (
          <div className="p-2 space-y-1">
            {mcp.servers.map((server: any, i: number) => (
              <div key={i} className="px-3 py-2 bg-white rounded-md border border-gray-200 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{server.name || (typeof server === 'string' ? server : JSON.stringify(server))}</span>
                {server.transport && <span className="text-xs text-gray-400 break-all ml-2">{typeof server.transport === 'string' ? server.transport : ''}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="p-8 text-center text-gray-400">No MCP servers</p>
        )}
      </div>
    </div>
  );
}
