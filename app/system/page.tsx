'use client';
export const dynamic = 'force-dynamic';
// app/system/page.tsx - System with parsed gateway status, MCP, code stats
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import Card from '../components/Card';
import { useAutoRefresh } from '../components/useAutoRefresh';

interface SystemData {
  health: any;
  gateway: any;
  mcp: any;
  codeStats: any;
}

function parseGatewayStatus(raw: string | undefined) {
  if (!raw) return null;
  const result: {
    status: string; uptime: string; memory: string; memoryPeak: string;
    cpu: string; processes: string[]; warnings: string[]; rawLines: string[];
  } = {
    status: 'unknown', uptime: '', memory: '', memoryPeak: '',
    cpu: '', processes: [], warnings: [], rawLines: [],
  };
  
  const lines = raw.split('\n');
  result.rawLines = lines.filter(l => l.trim());
  
  for (const line of lines) {
    if (line.includes('Active:')) {
      const m = line.match(/Active:\s*(\S+\s*\(\S+\))/);
      if (m) result.status = m[1];
      else {
        const simple = line.match(/Active:\s*(\S+)/);
        if (simple) result.status = simple[1];
      }
      const since = line.match(/since\s+(.+)/);
      if (since) result.uptime = since[1].trim().replace(/;.*/, '').trim();
    }
    if (line.includes('Memory:')) {
      const m = line.match(/Memory:\s*(.+)/);
      if (m) result.memory = m[1].trim();
    }
    if (line.includes('CPU:')) {
      const m = line.match(/CPU:\s*(.+)/);
      if (m) result.cpu = m[1].trim();
    }
    if (line.match(/[├└─│].*\d/)) {
      result.processes.push(line.trim());
    }
    if (/warn|error/i.test(line) && !line.includes('Active:') && !line.includes('CGroup')) {
      result.warnings.push(line.trim());
    }
  }
  return result;
}

export default function SystemPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<SystemData>({
    url: '/api/system',
    interval: 15000,
  });

  const health = data?.health || { status: 'unknown', timestamp: '' };
  const gatewayRaw = data?.gateway?.raw;
  const gateway = parseGatewayStatus(gatewayRaw);
  const mcp = data?.mcp || { servers: [] };
  const codeStats = data?.codeStats?.code_stats || [];

  const totalLines = codeStats.reduce((acc: number, p: any) => acc + (p.lines || 0), 0);
  const totalFiles = codeStats.reduce((acc: number, p: any) => acc + (p.files || 0), 0);

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
        subtitle="Hermes system status, MCP servers, and code statistics"
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Health + Gateway Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Service</p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-lg font-semibold text-gray-900">{health.status || 'unknown'}</span>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Uptime</p>
          <p className="text-sm font-medium text-gray-900">{gateway?.uptime || 'Not available'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Memory</p>
          <p className="text-sm font-medium text-gray-900">{gateway?.memory || 'Not available'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CPU Time</p>
          <p className="text-sm font-medium text-gray-900">{gateway?.cpu || 'Not available'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Gateway Status */}
        <Card title="Gateway Status" titleRight={
          gateway?.status ? (
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              gateway.status.includes('active') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              {gateway.status}
            </span>
          ) : null
        }>
          {gateway?.processes && gateway.processes.length > 0 ? (
            <div>
              <h3 className="text-xs text-gray-500 uppercase font-medium mb-2">Process Tree</h3>
              <div className="space-y-0.5 font-mono text-xs">
                {gateway.processes.map((p, i) => (
                  <div key={i} className="text-gray-600 bg-white px-2 py-1 rounded border border-gray-100">{p}</div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4 text-sm">Gateway status not available</p>
          )}
          {gateway?.warnings && gateway.warnings.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs text-gray-500 uppercase font-medium mb-2">Warnings</h3>
              <div className="space-y-1">
                {gateway.warnings.map((w, i) => (
                  <div key={i} className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1.5 rounded border border-yellow-200">{w}</div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* MCP Servers */}
        <Card title="MCP Servers" titleRight={
          <span className="text-xs text-gray-400">{mcp.servers?.length || 0} servers</span>
        }>
          {mcp.servers?.length > 0 ? (
            <div>
              <div className="text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded border border-yellow-200 mb-3">
                Note: MCP data may be incomplete due to a bridge parsing issue. Showing raw data.
              </div>
              <div className="space-y-1.5">
                {mcp.servers.map((server: any, i: number) => (
                  <div key={i} className="px-3 py-2 bg-white rounded-md border border-gray-200">
                    {typeof server === 'string' ? (
                      <span className="text-sm text-gray-700 font-mono">{server}</span>
                    ) : (
                      <div>
                        <span className="text-sm font-medium text-gray-900">{server.name || 'Unknown'}</span>
                        <pre className="text-xs text-gray-500 mt-1 whitespace-pre-wrap break-all">
                          {JSON.stringify(server, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4 text-sm">No MCP servers</p>
          )}
        </Card>
      </div>

      {/* Code Stats */}
      {codeStats.length > 0 && (
        <Card title="Code Statistics" titleRight={
          <span className="text-xs text-gray-400">{totalLines.toLocaleString()} lines · {totalFiles} files</span>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="pb-2 font-medium">Project</th>
                  <th className="pb-2 font-medium text-right">Files</th>
                  <th className="pb-2 font-medium text-right">Lines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codeStats.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-2 text-gray-900 font-medium">{p.project}</td>
                    <td className="py-2 text-gray-600 text-right">{p.files}</td>
                    <td className="py-2 text-gray-900 text-right font-mono">{p.lines?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
