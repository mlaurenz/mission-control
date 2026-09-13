'use client';
export const dynamic = 'force-dynamic';
// app/page.tsx - Dashboard: "What is Hermes doing right now?"
import PageHeader from './components/PageHeader';
import StatCard from './components/StatCard';
import Card from './components/Card';
import RefreshIndicator from './components/RefreshIndicator';
import { useAutoRefresh } from './components/useAutoRefresh';
import { timeAgo } from '../lib/utils/time';

interface DashboardData {
  health: any;
  sessions: any;
  kanbanBoards: any;
  kanbanTasks: any;
  activity: any;
  gatewayStatus: any;
  logs: any;
}

function parseGatewayStatus(raw: string | undefined) {
  if (!raw) return null;
  const result: { status: string; uptime: string; memory: string; memoryPeak: string; cpu: string; processes: string[]; warnings: string[] } = {
    status: 'unknown', uptime: '', memory: '', memoryPeak: '', cpu: '', processes: [], warnings: [],
  };
  
  const lines = raw.split('\n');
  for (const line of lines) {
    if (line.includes('Active:')) {
      const m = line.match(/Active:\s*(\S+)/);
      if (m) result.status = m[1];
      const since = line.match(/since\s+(.+)/);
      if (since) result.uptime = since[1].trim().replace(/;.*/, '').trim();
    }
    if (line.includes('Memory:') && !line.includes('peak')) {
      const m = line.match(/Memory:\s*(.+)/);
      if (m) result.memory = m[1].trim();
    }
    if (line.includes('peak')) {
      const m = line.match(/peak:\s*(\S+)/);
      if (m) result.memoryPeak = m[1];
    }
    if (line.includes('CPU:')) {
      const m = line.match(/CPU:\s*(.+)/);
      if (m) result.cpu = m[1].trim();
    }
    if (line.match(/[├└─│].*\d/)) {
      result.processes.push(line.trim().replace(/^[├└─│\s]+/, ''));
    }
    if (/warn|error/i.test(line) && !line.includes('Active:')) {
      result.warnings.push(line.trim());
    }
  }
  return result;
}

function StatusDot({ status }: { status: string }) {
  const isHealthy = status === 'healthy' || status === 'active';
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
  );
}

export default function Home() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<DashboardData>({
    url: '/api/dashboard',
    interval: 10000,
  });

  const health = data?.health || { status: 'unknown', timestamp: '' };
  const sessions = data?.sessions?.sessions || [];
  const boards = data?.kanbanBoards?.boards || [];
  const tasks = data?.kanbanTasks?.tasks || [];
  const activityEvents = data?.activity?.activity || [];
  const logLines = data?.logs?.logs || [];
  const gatewayRaw = data?.gatewayStatus?.raw;
  const gateway = parseGatewayStatus(gatewayRaw);

  // Task counts
  const counts: Record<string, number> = { todo: 0, ready: 0, blocked: 0, done: 0, archived: 0 };
  tasks.forEach((t: any) => {
    const s = t.status?.toLowerCase() || 'todo';
    if (counts[s] !== undefined) counts[s]++;
  });

  const activeBoards = boards.filter((b: any) => !b.archived);

  // Combined activity + logs for feed
  const feedItems: { type: string; text: string; time: string; level?: string }[] = [];
  activityEvents.forEach((a: any) => {
    feedItems.push({ type: 'event', text: a.description, time: a.timestamp || '' });
  });
  logLines.forEach((line: string) => {
    let level = 'info';
    if (/error/i.test(line)) level = 'error';
    else if (/warn/i.test(line)) level = 'warning';
    const timeMatch = line.match(/\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/);
    feedItems.push({ type: 'log', text: line, time: timeMatch ? timeMatch[0] : '', level });
  });
  feedItems.sort((a, b) => (b.time || '').localeCompare(a.time || ''));

  const recentSessions = sessions.slice(0, 6);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Hermes Operations Dashboard"
        status={health.status === 'healthy' ? 'online' : 'offline'}
        statusTimestamp={health.timestamp}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Health Status Bar */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <StatusDot status={health.status} />
          <span className="text-sm font-medium text-gray-900">
            {health.status === 'healthy' ? 'All systems operational' : 'Service degraded'}
          </span>
        </div>
        {gateway?.uptime && (
          <div className="text-sm text-gray-500">
            <span className="text-xs text-gray-400 uppercase mr-1">Uptime</span>
            {gateway.uptime}
          </div>
        )}
        {gateway?.memory && (
          <div className="text-sm text-gray-500">
            <span className="text-xs text-gray-400 uppercase mr-1">Memory</span>
            {gateway.memory}
          </div>
        )}
        {gateway?.cpu && (
          <div className="text-sm text-gray-500">
            <span className="text-xs text-gray-400 uppercase mr-1">CPU</span>
            {gateway.cpu}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <section className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total Tasks" value={tasks.length} />
          <StatCard label="To Do" value={counts.todo} />
          <StatCard label="Ready" value={counts.ready} variant="blue" />
          <StatCard
            label="Blocked"
            value={counts.blocked}
            variant={counts.blocked > 0 ? 'alert' : 'red'}
            alertLabel={counts.blocked > 0 ? 'Alert' : undefined}
          />
          <StatCard label="Done" value={counts.done} variant="green" />
          <StatCard label="Active Boards" value={activeBoards.length} variant="yellow" />
        </div>
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Left: Live Activity Feed */}
        <Card title="Live Activity" titleRight={<span className="text-xs text-gray-400">{feedItems.length} events</span>}>
          <div className="max-h-96 overflow-y-auto -m-4 mt-0">
            {feedItems.length > 0 ? feedItems.slice(0, 50).map((item, i) => {
              const levelColor = item.level === 'error' ? 'border-l-red-500 bg-red-50/50' 
                : item.level === 'warning' ? 'border-l-yellow-500 bg-yellow-50/50'
                : item.type === 'event' ? 'border-l-blue-500'
                : 'border-l-gray-300';
              return (
                <div key={i} className={`px-4 py-2 border-l-2 ${levelColor} border-b border-gray-100 last:border-b-0`}>
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[0.6rem] uppercase font-medium ${
                      item.type === 'event' ? 'bg-blue-100 text-blue-600' 
                      : item.level === 'error' ? 'bg-red-100 text-red-600'
                      : item.level === 'warning' ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.type === 'event' ? 'event' : (item.level || 'log')}
                    </span>
                    <span className="text-xs text-gray-700 leading-relaxed break-all">{item.text}</span>
                  </div>
                  {item.time && (
                    <div className="text-[0.6rem] text-gray-400 mt-0.5 ml-12">{timeAgo(item.time)}</div>
                  )}
                </div>
              );
            }) : (
              <p className="text-gray-400 text-center py-8 text-sm">No recent activity</p>
            )}
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Board Overview */}
          <Card title="Projects" titleRight={<span className="text-xs text-gray-400">{activeBoards.length} active</span>}>
            <div className="space-y-3">
              {activeBoards.length > 0 ? activeBoards.map((b: any, i: number) => {
                const c = b.counts || {};
                const total = b.total || 0;
                const done = c.done || 0;
                const blocked = c.blocked || 0;
                const ready = c.ready || 0;
                const todo = c.todo || 0;
                return (
                  <div key={i} className="p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{b.name}</span>
                        {b.is_current && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[0.6rem] rounded font-medium uppercase">current</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{total} tasks</span>
                    </div>
                    {/* Status distribution bar */}
                    {total > 0 && (
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
                        {done > 0 && <div className="bg-green-500" style={{ width: `${(done / total) * 100}%` }} />}
                        {ready > 0 && <div className="bg-blue-500" style={{ width: `${(ready / total) * 100}%` }} />}
                        {todo > 0 && <div className="bg-gray-400" style={{ width: `${(todo / total) * 100}%` }} />}
                        {blocked > 0 && <div className="bg-red-500" style={{ width: `${(blocked / total) * 100}%` }} />}
                      </div>
                    )}
                    <div className="flex gap-3 mt-1.5 text-[0.65rem] text-gray-400">
                      <span>{done} done</span>
                      <span>{ready} ready</span>
                      <span>{todo} todo</span>
                      {blocked > 0 && <span className="text-red-500 font-medium">{blocked} blocked</span>}
                    </div>
                  </div>
                );
              }) : (
                <p className="text-gray-400 text-center py-6 text-sm">No active projects</p>
              )}
            </div>
          </Card>

          {/* Recent Sessions */}
          <Card title="Recent Sessions" titleRight={<span className="text-xs text-gray-400">{sessions.length} total</span>}>
            <div className="space-y-1.5">
              {recentSessions.length > 0 ? recentSessions.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-md border border-gray-200">
                  <span className="text-sm text-gray-900 truncate mr-3">{s.title?.substring(0, 50) || 'Untitled'}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                    {timeAgo(s.last_active)}
                  </span>
                </div>
              )) : (
                <p className="text-gray-400 text-center py-6 text-sm">No sessions</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom: System Info */}
      {gateway && (gateway.processes.length > 0 || gateway.warnings.length > 0) && (
        <Card title="System" titleRight={
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
            gateway.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {gateway.status}
          </span>
        }>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {gateway.processes.length > 0 && (
              <div>
                <h3 className="text-xs text-gray-500 uppercase font-medium mb-2">Process Tree</h3>
                <div className="space-y-1">
                  {gateway.processes.map((p, i) => (
                    <div key={i} className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border border-gray-100">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {gateway.warnings.length > 0 && (
              <div>
                <h3 className="text-xs text-gray-500 uppercase font-medium mb-2">Warnings</h3>
                <div className="space-y-1">
                  {gateway.warnings.map((w, i) => (
                    <div key={i} className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
