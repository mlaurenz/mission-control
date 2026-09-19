'use client';
export const dynamic = 'force-dynamic';
// app/clients/[slug]/page.tsx — Client detail page

import { useParams } from 'next/navigation';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import RefreshIndicator from '../../components/RefreshIndicator';
import { useAutoRefresh } from '../../components/useAutoRefresh';
import { timeAgo } from '../../../lib/utils/time';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  status: 'blocked' | 'ready' | 'todo' | 'done' | 'archived';
  assignee?: string;
  created_at: string;
  started_at?: string | null;
  board?: string;
}

interface Agent {
  name: string;
  model: string;
  provider: string;
  has_soul: boolean;
  mcp_servers?: number;
}

interface CronJob {
  name: string;
  schedule: string;
  last_run?: string;
  last_status?: string;
}

interface ClientDetail {
  slug: string;
  name: string;
  status: string;
  tasks: Task[];
  agents: Agent[];
  cron_jobs: CronJob[];
  counts?: {
    todo: number;
    ready: number;
    blocked: number;
    done: number;
    archived: number;
  };
}

const STATUS_ORDER = ['blocked', 'ready', 'todo', 'done', 'archived'];
const STATUS_COLORS: Record<string, string> = {
  blocked: 'bg-red-100 text-red-700 border-red-200',
  ready: 'bg-blue-100 text-blue-700 border-blue-200',
  todo: 'bg-gray-100 text-gray-700 border-gray-200',
  done: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-gray-50 text-gray-400 border-gray-200',
};

const TABS = ['Tasks', 'Agents', 'Activity'] as const;
type Tab = typeof TABS[number];

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'bg-orange-100 text-orange-700',
  minimax: 'bg-purple-100 text-purple-700',
  openrouter: 'bg-blue-100 text-blue-700',
  openai: 'bg-green-100 text-green-700',
};

const CRON_STATUS_COLORS: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  running: 'bg-blue-100 text-blue-700',
};

export default function ClientDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<Tab>('Tasks');

  const { data, loading, lastUpdated, refetch } = useAutoRefresh<ClientDetail>({
    url: `/api/clients/${slug}`,
    interval: 10000,
  });

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading client...</p>
        </div>
      </div>
    );
  }

  const clientName = data?.name || slug;
  const tasks = data?.tasks || [];
  const agents = data?.agents || [];
  const cronJobs = data?.cron_jobs || [];

  // Compute counts from tasks if not provided
  const counts = data?.counts || tasks.reduce(
    (acc, t) => {
      const s = t.status?.toLowerCase() as keyof typeof acc;
      if (s in acc) acc[s]++;
      return acc;
    },
    { todo: 0, ready: 0, blocked: 0, done: 0, archived: 0 }
  );

  const active = (counts.todo || 0) + (counts.ready || 0) + (counts.blocked || 0);

  // Group tasks by status
  const grouped: Record<string, Task[]> = {};
  STATUS_ORDER.forEach(s => { grouped[s] = []; });
  tasks.forEach((t) => {
    const s = t.status?.toLowerCase() || 'todo';
    if (grouped[s]) grouped[s].push(t);
  });

  function formatDate(d: any) {
    if (!d) return '';
    try {
      const ts = typeof d === 'number' && d < 1e12 ? d * 1000 : d;
      return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return String(d); }
  }

  return (
    <div>
      <PageHeader
        title={clientName}
        subtitle={`Client overview · ${slug}`}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Active Tasks" value={active} variant={active > 0 ? 'blue' : 'default'} />
        <StatCard label="Done" value={counts.done || 0} variant="green" />
        <StatCard
          label="Blocked"
          value={counts.blocked || 0}
          variant={(counts.blocked || 0) > 0 ? 'alert' : 'default'}
          alertLabel={(counts.blocked || 0) > 0 ? 'attention' : undefined}
        />
        <StatCard label="Agents" value={agents.length} variant="default" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 pb-px">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer
              ${activeTab === tab
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
          >
            {tab}
            {tab === 'Tasks' && tasks.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({tasks.length})</span>
            )}
            {tab === 'Agents' && agents.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({agents.length})</span>
            )}
            {tab === 'Activity' && cronJobs.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({cronJobs.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tasks tab */}
      {activeTab === 'Tasks' && (
        <div>
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {STATUS_ORDER.map(status => {
                const statusTasks = grouped[status];
                if (!statusTasks || statusTasks.length === 0) return null;
                return (
                  <div key={status}>
                    <h4 className={`text-xs font-semibold uppercase mb-2 ${
                      status === 'blocked' ? 'text-red-600'
                        : status === 'done' ? 'text-green-600'
                        : status === 'ready' ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}>
                      {status} ({statusTasks.length})
                    </h4>
                    <div className="space-y-1">
                      {statusTasks.map((task, i) => (
                        <div
                          key={task.id || i}
                          className={`p-2.5 rounded-md border text-sm ${
                            status === 'blocked'
                              ? 'border-l-2 border-l-red-500 border-red-200 bg-red-50/50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900">{task.title}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
                              {status}
                            </span>
                          </div>
                          <div className="text-[0.65rem] text-gray-400 mt-1 flex gap-3">
                            {task.assignee && <span>Assignee: {task.assignee}</span>}
                            {task.created_at && <span>Created {formatDate(task.created_at)}</span>}
                            {task.started_at && <span>Started {formatDate(task.started_at)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
              <p className="text-gray-400">No tasks for this client</p>
            </div>
          )}
        </div>
      )}

      {/* Agents tab */}
      {activeTab === 'Agents' && (
        <div>
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {agents.map((agent, i) => {
                const providerStyle = PROVIDER_COLORS[agent.provider] || 'bg-gray-100 text-gray-600';
                return (
                  <div key={agent.name || i} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900">{agent.name}</span>
                      {agent.has_soul && (
                        <span className="text-[0.6rem] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded" title="Has SOUL.md">♦ Soul</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {agent.model && (
                        <span className={`text-[0.65rem] px-1.5 py-0.5 rounded font-medium ${providerStyle}`}>
                          {agent.model}
                        </span>
                      )}
                      {agent.provider && (
                        <span className="text-[0.6rem] text-gray-400">{agent.provider}</span>
                      )}
                    </div>
                    {(agent.mcp_servers !== undefined && agent.mcp_servers > 0) && (
                      <p className="text-[0.65rem] text-gray-500">
                        {agent.mcp_servers} MCP server{agent.mcp_servers !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
              <p className="text-gray-400">No agents assigned to this client</p>
            </div>
          )}
        </div>
      )}

      {/* Activity tab */}
      {activeTab === 'Activity' && (
        <div>
          {cronJobs.length > 0 ? (
            <Card title="Cron Jobs">
              <div className="space-y-1">
                {cronJobs.map((job, i) => {
                  const statusStyle = CRON_STATUS_COLORS[job.last_status || ''] || 'bg-gray-100 text-gray-500';
                  return (
                    <div key={job.name || i} className="flex items-center justify-between p-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{job.name}</span>
                        <span className="ml-2 text-[0.65rem] text-gray-400 font-mono">{job.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.last_run && (
                          <span className="text-[0.65rem] text-gray-400">{timeAgo(job.last_run)}</span>
                        )}
                        {job.last_status && (
                          <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-medium ${statusStyle}`}>
                            {job.last_status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
              <p className="text-gray-400">No cron jobs for this client</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
