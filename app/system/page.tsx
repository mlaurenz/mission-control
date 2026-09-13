// app/system/page.tsx - System Page with Tailwind
import { getHealth, getGatewayStatus, getMCP } from '../../lib/connectors/HermesConnector';
import PageHeader from '../components/PageHeader';

export const dynamic = 'force-dynamic';

export default async function SystemPage() {
  let health = { status: 'unknown', timestamp: '' };
  let gateway = { processes: 0, uptime: '' };
  let mcp = { servers: [] as any[] };

  try { health = (await getHealth()) || health; } catch {}
  try { gateway = (await getGatewayStatus()) || gateway; } catch {}
  try { mcp = (await getMCP()) || mcp; } catch {}

  return (
    <div>
      <PageHeader title="System" icon="⚙️" subtitle="Hermes system status and health" />

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
          <p className="text-xs text-gray-500 uppercase tracking-wider">Model</p>
          <p className="text-lg font-medium text-blue-600 mt-1">MiniMax-M2</p>
        </div>
      </div>

      {/* MCP Servers */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">🔌 MCP Servers</h2>
        </div>
        {mcp.servers?.length > 0 ? (
          <div className="p-2 space-y-1">
            {mcp.servers.map((server: any, i: number) => (
              <div key={i} className="px-3 py-2 bg-white rounded-md border border-gray-200">
                <span className="text-sm font-medium text-gray-900">{server.name || server}</span>
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
