'use client';
export const dynamic = 'force-dynamic';
// app/clients/page.tsx — Client list page

import Link from 'next/link';
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';

interface ClientCounts {
  todo: number;
  ready: number;
  blocked: number;
  done: number;
  archived: number;
}

interface ClientSummary {
  slug: string;
  name: string;
  status: 'healthy' | 'warning' | 'inactive';
  counts: ClientCounts;
  total: number;
  agents_count: number;
}

interface ClientsResponse {
  clients: ClientSummary[];
}

const STATUS_DOT: Record<string, string> = {
  healthy: 'bg-green-500',
  warning: 'bg-yellow-500',
  inactive: 'bg-gray-400',
};

export default function ClientsPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<ClientsResponse>({
    url: '/api/clients',
    interval: 15000,
  });

  const clients = data?.clients || [];

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
        subtitle="Agent operations by client"
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {clients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map((client) => {
            const c = client.counts || { todo: 0, ready: 0, blocked: 0, done: 0, archived: 0 };
            const total = client.total || 0;
            const active = (c.todo || 0) + (c.ready || 0) + (c.blocked || 0);
            const done = c.done || 0;
            const blocked = c.blocked || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <Link
                key={client.slug}
                href={`/clients/${client.slug}`}
                className="block bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all"
              >
                {/* Header with status dot */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[client.status] || 'bg-gray-400'}`} />
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{client.name}</h3>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                  <span>{active} active</span>
                  <span className="text-green-600">{done} done</span>
                  {blocked > 0 && (
                    <span className="text-red-600 font-medium">{blocked} blocked</span>
                  )}
                  <span className="ml-auto">{client.agents_count || 0} agents</span>
                </div>

                {/* Progress bar */}
                {total > 0 && (
                  <div className="mb-1.5">
                    <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                      {done > 0 && (
                        <div
                          className="bg-green-500 transition-all"
                          style={{ width: `${(done / total) * 100}%` }}
                        />
                      )}
                      {(c.ready || 0) > 0 && (
                        <div
                          className="bg-blue-500 transition-all"
                          style={{ width: `${((c.ready || 0) / total) * 100}%` }}
                        />
                      )}
                      {(c.todo || 0) > 0 && (
                        <div
                          className="bg-gray-400 transition-all"
                          style={{ width: `${((c.todo || 0) / total) * 100}%` }}
                        />
                      )}
                      {blocked > 0 && (
                        <div
                          className="bg-red-500 transition-all"
                          style={{ width: `${(blocked / total) * 100}%` }}
                        />
                      )}
                    </div>
                    <p className="text-[0.6rem] text-gray-400 mt-1 text-right">{pct}% complete</p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
          <p className="text-gray-400">No clients found</p>
        </div>
      )}
    </div>
  );
}
