'use client';
export const dynamic = 'force-dynamic';
// app/page.tsx - Home: Client-centric dashboard for agent sales

import Link from 'next/link';
import PageHeader from './components/PageHeader';
import StatCard from './components/StatCard';
import RefreshIndicator from './components/RefreshIndicator';
import { useAutoRefresh } from './components/useAutoRefresh';

interface ClientSummary {
  slug: string;
  name: string;
  status_color: 'green' | 'yellow' | 'gray';
  profiles: string[];
  agents_count: number;
  has_mcp: boolean;
  active_tasks: number;
  done_tasks: number;
  blocked_tasks: number;
  board: {
    counts: Record<string, number>;
    total: number;
    created_at: string | null;
  };
}

interface ClientsResponse {
  clients: ClientSummary[];
  total: number;
}

const STATUS_DOT: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  gray: 'bg-gray-300',
};

const STATUS_RING: Record<string, string> = {
  green: 'ring-green-200',
  yellow: 'ring-yellow-200',
  gray: 'ring-gray-200',
};

const STATUS_LABEL: Record<string, string> = {
  green: 'Active',
  yellow: 'Needs attention',
  gray: 'No agents',
};

function sortByStatus(a: ClientSummary, b: ClientSummary): number {
  const order: Record<string, number> = { green: 0, yellow: 1, gray: 2 };
  const diff = (order[a.status_color] ?? 3) - (order[b.status_color] ?? 3);
  if (diff !== 0) return diff;
  // Secondary: by active tasks descending
  return b.active_tasks - a.active_tasks;
}

export default function Home() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<ClientsResponse>({
    url: '/api/clients',
    interval: 15000,
  });

  const clients = (data?.clients || []).slice().sort(sortByStatus);

  // Aggregate stats
  const totalClients = clients.length;
  const totalActive = clients.reduce((s, c) => s + c.active_tasks, 0);
  const totalBlocked = clients.reduce((s, c) => s + c.blocked_tasks, 0);
  const totalAgents = new Set(clients.flatMap(c => c.profiles)).size;
  const totalDone = clients.reduce((s, c) => s + c.done_tasks, 0);
  const withAgents = clients.filter(c => c.agents_count > 0).length;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${totalClients} clients · ${withAgents} with agents deployed`}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Summary Stats */}
      <section className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Clients" value={totalClients} />
          <StatCard label="Active Tasks" value={totalActive} variant={totalActive > 0 ? 'blue' : 'default'} />
          <StatCard
            label="Blocked"
            value={totalBlocked}
            variant={totalBlocked > 0 ? 'alert' : 'default'}
            alertLabel={totalBlocked > 0 ? 'attention' : undefined}
          />
          <StatCard label="Agents Deployed" value={totalAgents} variant="yellow" />
          <StatCard label="Completed" value={totalDone} variant="green" />
        </div>
      </section>

      {/* Client Grid */}
      {clients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map((client) => {
            const total = client.board.total || 0;
            const done = client.done_tasks;
            const blocked = client.blocked_tasks;
            const active = client.active_tasks;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const counts = client.board.counts || {};

            return (
              <Link
                key={client.slug}
                href={`/clients/${client.slug}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all group"
              >
                {/* Header: status dot + name */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ${STATUS_DOT[client.status_color]} ${STATUS_RING[client.status_color]}`} />
                  <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">{client.name}</h3>
                  {client.has_mcp && (
                    <span className="text-[0.6rem] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">MCP</span>
                  )}
                </div>

                {/* Agents assigned */}
                {client.profiles.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {client.profiles.map(p => (
                      <span key={p} className="text-[0.65rem] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[0.65rem] text-gray-400 mb-3 italic">No agents assigned</p>
                )}

                {/* Stats row */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                  <span>{active} active</span>
                  <span className="text-green-600">{done} done</span>
                  {blocked > 0 && (
                    <span className="text-red-600 font-semibold">{blocked} blocked</span>
                  )}
                  <span className="ml-auto text-gray-400">{client.agents_count} agent{client.agents_count !== 1 ? 's' : ''}</span>
                </div>

                {/* Progress bar */}
                {total > 0 && (
                  <div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                      {done > 0 && (
                        <div className="bg-green-500 transition-all" style={{ width: `${(done / total) * 100}%` }} />
                      )}
                      {(counts.ready || 0) > 0 && (
                        <div className="bg-blue-500 transition-all" style={{ width: `${((counts.ready || 0) / total) * 100}%` }} />
                      )}
                      {(counts.todo || 0) > 0 && (
                        <div className="bg-gray-300 transition-all" style={{ width: `${((counts.todo || 0) / total) * 100}%` }} />
                      )}
                      {blocked > 0 && (
                        <div className="bg-red-500 transition-all" style={{ width: `${(blocked / total) * 100}%` }} />
                      )}
                    </div>
                    <p className="text-[0.6rem] text-gray-400 mt-1 text-right">{pct}% complete</p>
                  </div>
                )}

                {/* Status label */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`text-[0.6rem] font-medium ${
                    client.status_color === 'green' ? 'text-green-600' :
                    client.status_color === 'yellow' ? 'text-yellow-600' :
                    'text-gray-400'
                  }`}>
                    {STATUS_LABEL[client.status_color]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
          <p className="text-gray-400">No clients found</p>
          <p className="text-gray-400 text-sm mt-1">Configure clients in clients.json on the bridge</p>
        </div>
      )}
    </div>
  );
}
