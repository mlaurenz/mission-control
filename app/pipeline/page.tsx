'use client';
export const dynamic = 'force-dynamic';
// app/pipeline/page.tsx - Cross-client task pipeline by status

import Link from 'next/link';
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { useState } from 'react';

interface ClientSummary {
  slug: string;
  name: string;
  status_color: string;
  active_tasks: number;
  done_tasks: number;
  blocked_tasks: number;
  board: { counts: Record<string, number>; total: number };
  tasks?: { id: string; title: string; status: string; assignee?: string; created_at?: string; started_at?: string }[];
}

// We fetch all client details to get tasks per client
interface ClientsResponse {
  clients: ClientSummary[];
  total: number;
}

const STATUS_ORDER = ['blocked', 'ready', 'todo', 'done'];
const STATUS_CONFIG: Record<string, { label: string; border: string; badge: string; bg: string }> = {
  blocked: { label: 'Blocked', border: 'border-t-red-500', badge: 'text-red-600', bg: 'bg-red-50' },
  ready: { label: 'Ready', border: 'border-t-blue-500', badge: 'text-blue-600', bg: 'bg-blue-50/50' },
  todo: { label: 'To Do', border: 'border-t-gray-400', badge: 'text-gray-600', bg: 'bg-gray-50' },
  done: { label: 'Done', border: 'border-t-green-500', badge: 'text-green-600', bg: 'bg-green-50/50' },
};

export default function PipelinePage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<ClientsResponse>({
    url: '/api/clients',
    interval: 15000,
  });

  const [activeClient, setActiveClient] = useState<string | null>(null);

  const clients = data?.clients || [];

  // Build flat task list from board counts (we don't have individual tasks from /clients, use counts)
  // For pipeline we aggregate counts across clients
  const filteredClients = activeClient
    ? clients.filter(c => c.slug === activeClient)
    : clients;

  // Aggregate counts across filtered clients
  const totalCounts: Record<string, { count: number; clients: { slug: string; name: string; count: number }[] }> = {};
  STATUS_ORDER.forEach(s => { totalCounts[s] = { count: 0, clients: [] }; });

  filteredClients.forEach(client => {
    const counts = client.board?.counts || {};
    STATUS_ORDER.forEach(status => {
      const c = counts[status] || 0;
      if (c > 0) {
        totalCounts[status].count += c;
        totalCounts[status].clients.push({ slug: client.slug, name: client.name, count: c });
      }
    });
  });

  const totalTasks = Object.values(totalCounts).reduce((s, v) => s + v.count, 0);

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
        title="Pipeline"
        subtitle={`${totalTasks} tasks across ${filteredClients.length} clients`}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500">
          <span className="text-gray-900 font-semibold">{totalTasks}</span> total
        </div>
        {STATUS_ORDER.map(s => {
          const tc = totalCounts[s];
          if (tc.count === 0) return null;
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="text-sm text-gray-500">
              <span className={`font-semibold ${cfg.badge}`}>{tc.count}</span> {cfg.label}
            </div>
          );
        })}
      </div>

      {/* Client filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setActiveClient(null)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
            ${!activeClient ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All Clients
        </button>
        {clients.filter(c => c.board.total > 0).map(client => (
          <button
            key={client.slug}
            onClick={() => setActiveClient(client.slug)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
              ${activeClient === client.slug ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {client.name}
          </button>
        ))}
      </div>

      {/* Status columns */}
      {totalTasks > 0 ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(STATUS_ORDER.filter(s => totalCounts[s].count > 0).length, 4)}, minmax(200px, 1fr))` }}>
          {STATUS_ORDER.map(status => {
            const tc = totalCounts[status];
            if (tc.count === 0) return null;
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={status}>
                <div className={`p-3 border-t-2 ${cfg.border} rounded-t mb-2 ${cfg.bg}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">{cfg.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tc.count}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {tc.clients.map(client => (
                    <Link
                      key={client.slug}
                      href={`/clients/${client.slug}`}
                      className="block p-3 rounded-md border border-gray-200 bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{client.name}</span>
                        <span className={`text-xs font-semibold ${cfg.badge}`}>{client.count}</span>
                      </div>
                      <div className="text-[0.65rem] text-gray-400 mt-1">
                        {client.count} {status} task{client.count !== 1 ? 's' : ''}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
          <p className="text-gray-400">No tasks in pipeline</p>
        </div>
      )}
    </div>
  );
}
