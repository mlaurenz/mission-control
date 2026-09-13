'use client';
export const dynamic = 'force-dynamic';
// app/agents/page.tsx — Agent observability from real Hermes data
// Sources: /gateway/status (processes), /sessions (history), /logs (agent activity), /mcp (connections)

import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { timeAgo } from '../../lib/utils/time';
import { useState } from 'react';

interface AgentsPageData {
  health: any;
  sessions: any;
  gateway: any;
  logs: any;
  mcp: any;
}

// Parse the systemd gateway status to extract process tree
function parseProcesses(raw: string): { pid: string; cmd: string; label: string }[] {
  if (!raw) return [];
  const processes: { pid: string; cmd: string; label: string }[] = [];
  const lines = raw.split('\n');
  for (const line of lines) {
    // Match lines like: ├─192178 /usr/local/lib/hermes-agent/venv/bin/python -m hermes_cli.main gateway run
    const match = line.match(/[├└]─(\d+)\s+(.+)/);
    if (match) {
      const pid = match[1];
      const cmd = match[2].trim();
      // Derive a human label from the command
      let label = 'Process';
      if (cmd.includes('gateway run')) label = 'Gateway (main agent)';
      else if (cmd.includes('mcp') && cmd.includes('daemon')) label = 'MCP Daemon';
      else if (cmd.includes('mcp_death_supervisor')) label = 'MCP Supervisor';
      else if (cmd.includes('browser_harness')) label = 'Browser Agent';
      else if (cmd.includes('kernel_runner')) label = 'Kernel Runner';
      else if (cmd.includes('node') && cmd.includes('cli.js')) label = 'MCP Server (Node)';
      else label = cmd.split('/').pop()?.split(' ')[0] || 'Process';
      processes.push({ pid, cmd, label });
    }
  }
  return processes;
}

// Parse gateway status for uptime, memory, etc.
function parseGatewayMeta(raw: string) {
  const meta: Record<string, string> = {};
  if (!raw) return meta;
  const activeMatch = raw.match(/Active:\s*(.+?)(?:\n|$)/);
  if (activeMatch) meta.status = activeMatch[1].trim();
  const memMatch = raw.match(/Memory:\s*(.+?)(?:\n|$)/);
  if (memMatch) meta.memory = memMatch[1].trim();
  const cpuMatch = raw.match(/CPU:\s*(.+?)(?:\n|$)/);
  if (cpuMatch) meta.cpu = cpuMatch[1].trim();
  const tasksMatch = raw.match(/Tasks:\s*(.+?)(?:\n|$)/);
  if (tasksMatch) meta.tasks = tasksMatch[1].trim();
  const pidMatch = raw.match(/Main PID:\s*(\d+)/);
  if (pidMatch) meta.mainPid = pidMatch[1];
  return meta;
}

// Extract agent-related log lines (tool executions, responses, warnings)
function parseAgentLogs(logs: string[]): { timestamp: string; level: string; source: string; message: string; raw: string }[] {
  if (!logs) return [];
  return logs
    .filter(line => {
      const lower = line.toLowerCase();
      return lower.includes('agent.') || lower.includes('gateway.run') || 
             lower.includes('tool_executor') || lower.includes('response ready') ||
             lower.includes('session') || lower.includes('mcp_tool') ||
             lower.includes('warning') || lower.includes('error');
    })
    .map(line => {
      const tsMatch = line.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
      const levelMatch = line.match(/\b(INFO|WARNING|ERROR|CRITICAL)\b/);
      const sourceMatch = line.match(/(?:INFO|WARNING|ERROR)\s+([a-zA-Z_][a-zA-Z0-9_.]+):/);
      return {
        timestamp: tsMatch ? tsMatch[1] : '',
        level: levelMatch ? levelMatch[1] : 'INFO',
        source: sourceMatch ? sourceMatch[1] : '',
        message: line.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d+\s+(INFO|WARNING|ERROR|CRITICAL)\s+[a-zA-Z_][a-zA-Z0-9_.]+:\s*/, ''),
        raw: line,
      };
    })
    .reverse(); // newest first
}

const LEVEL_STYLES: Record<string, string> = {
  ERROR: 'bg-red-100 text-red-700 border-l-red-500',
  WARNING: 'bg-yellow-50 text-yellow-800 border-l-yellow-500',
  INFO: 'bg-white text-gray-700 border-l-gray-300',
  CRITICAL: 'bg-red-200 text-red-900 border-l-red-700',
};

const LEVEL_BADGE: Record<string, string> = {
  ERROR: 'bg-red-100 text-red-700',
  WARNING: 'bg-yellow-100 text-yellow-700',
  INFO: 'bg-gray-100 text-gray-500',
  CRITICAL: 'bg-red-200 text-red-800',
};

export default function AgentsPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<AgentsPageData>({
    url: '/api/agents',
    interval: 8000,
  });

  const [logFilter, setLogFilter] = useState<string>('all');

  const health = data?.health || { status: 'unknown' };
  const sessions = data?.sessions?.sessions || [];
  const gatewayRaw = data?.gateway?.raw || '';
  const logs = data?.logs?.logs || [];
  const mcpServers = data?.mcp?.servers || [];

  const processes = parseProcesses(gatewayRaw);
  const gatewayMeta = parseGatewayMeta(gatewayRaw);
  const agentLogs = parseAgentLogs(logs);

  // Filter logs
  const filteredLogs = logFilter === 'all' ? agentLogs
    : logFilter === 'warnings' ? agentLogs.filter(l => l.level === 'WARNING' || l.level === 'ERROR' || l.level === 'CRITICAL')
    : logFilter === 'errors' ? agentLogs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL')
    : logFilter === 'tools' ? agentLogs.filter(l => l.source.includes('tool_executor') || l.source.includes('mcp_tool'))
    : agentLogs;

  const errorCount = agentLogs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length;
  const warningCount = agentLogs.filter(l => l.level === 'WARNING').length;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Running processes, sessions, and agent activity log"
        status={health.status === 'healthy' ? 'online' : 'offline'}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Active Processes */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Active Processes</h2>
          {gatewayMeta.status && (
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              gatewayMeta.status.includes('running') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {gatewayMeta.status.includes('running') ? 'Running' : gatewayMeta.status}
            </span>
          )}
        </div>

        {/* Meta stats row */}
        {Object.keys(gatewayMeta).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {gatewayMeta.memory && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <p className="text-[0.65rem] text-gray-500 uppercase tracking-wider">Memory</p>
                <p className="text-sm font-semibold text-gray-900">{gatewayMeta.memory}</p>
              </div>
            )}
            {gatewayMeta.cpu && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <p className="text-[0.65rem] text-gray-500 uppercase tracking-wider">CPU Time</p>
                <p className="text-sm font-semibold text-gray-900">{gatewayMeta.cpu}</p>
              </div>
            )}
            {gatewayMeta.tasks && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <p className="text-[0.65rem] text-gray-500 uppercase tracking-wider">Threads</p>
                <p className="text-sm font-semibold text-gray-900">{gatewayMeta.tasks}</p>
              </div>
            )}
            {gatewayMeta.mainPid && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <p className="text-[0.65rem] text-gray-500 uppercase tracking-wider">Main PID</p>
                <p className="text-sm font-mono font-semibold text-gray-900">{gatewayMeta.mainPid}</p>
              </div>
            )}
          </div>
        )}

        {/* Process tree */}
        {processes.length > 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            {processes.map((proc, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-blue-400'}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">{proc.label}</span>
                  <span className="text-xs text-gray-400 ml-2">PID {proc.pid}</span>
                </div>
                <span className="text-[0.65rem] text-gray-400 font-mono truncate max-w-[300px] hidden sm:block" title={proc.cmd}>
                  {proc.cmd.length > 60 ? '...' + proc.cmd.slice(-55) : proc.cmd}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-400 text-sm">
            Process data not available
          </div>
        )}
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Recent Sessions (Agent History) */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Session History</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            {sessions.length > 0 ? (
              <div className="max-h-80 overflow-auto">
                {sessions.map((s: any, i: number) => (
                  <div key={i} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-100/50 transition-colors`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-gray-900 leading-snug">{s.title || 'Untitled'}</span>
                      <span className="text-[0.65rem] text-gray-400 whitespace-nowrap mt-0.5">{timeAgo(s.last_active)}</span>
                    </div>
                    {s.workspace && s.workspace !== 'ago' && s.workspace !== 'now' && (
                      <span className="text-xs text-gray-400 font-mono mt-0.5 block">{s.workspace}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm">No sessions available</div>
            )}
          </div>
        </section>

        {/* MCP Connections */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">MCP Connections</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            {mcpServers.length > 0 ? (
              <>
                <div className="px-4 py-2 border-b border-gray-200 bg-yellow-50">
                  <p className="text-[0.65rem] text-yellow-700">Data may be incomplete — bridge MCP parsing has known issues</p>
                </div>
                {mcpServers.map((server: any, i: number) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                    <span className={`w-2 h-2 rounded-full ${server.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-900">{server.name}</span>
                    <span className={`text-[0.65rem] px-1.5 py-0.5 rounded ${
                      server.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {server.enabled ? 'enabled' : 'disabled'}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm">No MCP server data</div>
            )}
          </div>
        </section>
      </div>

      {/* Agent Activity Log */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Agent Activity Log</h2>
          <div className="flex items-center gap-1.5 text-xs">
            {agentLogs.length > 0 && (
              <span className="text-gray-400 mr-2">{filteredLogs.length} entries</span>
            )}
            {errorCount > 0 && (
              <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">{errorCount} errors</span>
            )}
            {warningCount > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">{warningCount} warnings</span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 mb-3">
          {[
            { key: 'all', label: 'All' },
            { key: 'warnings', label: 'Warnings & Errors' },
            { key: 'errors', label: 'Errors Only' },
            { key: 'tools', label: 'Tool Executions' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setLogFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer
                ${logFilter === f.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Log entries */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-auto">
            {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
              <div key={i} className={`px-4 py-2 border-l-2 ${LEVEL_STYLES[log.level] || LEVEL_STYLES.INFO} ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                <div className="flex items-start gap-2">
                  <span className={`text-[0.6rem] px-1.5 py-0.5 rounded font-medium mt-0.5 whitespace-nowrap ${LEVEL_BADGE[log.level] || LEVEL_BADGE.INFO}`}>
                    {log.level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 leading-relaxed break-all">{log.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {log.timestamp && <span className="text-[0.6rem] text-gray-400">{log.timestamp}</span>}
                      {log.source && <span className="text-[0.6rem] text-gray-400 font-mono">{log.source}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                {agentLogs.length === 0 ? 'No agent activity in recent logs' : 'No entries match this filter'}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
