'use client';
export const dynamic = 'force-dynamic';
// app/clients/[slug]/page.tsx — Client detail: tasks, agents, automations

import { useParams } from 'next/navigation';
import Link from 'next/link';
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
  status: string;
  assignee?: string;
  created_at: string;
  started_at?: string | null;
  body?: string;
}

interface ProfileDetail {
  name: string;
  model: string;
  provider: string;
  has_soul: boolean;
  mcp_servers_count: number;
  sessions_count: number;
  latest_session: string | null;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  profile: string;
  last_run: string;
  last_status: string;
  next_run: string;
}

interface ClientDetail {
  slug: string;
  name: string;
  status_color: string;
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
  tasks: Task[];
  profile_details: ProfileDetail[];
  cron_jobs: CronJob[];
}

const STATUS_ORDER = ['blocked', 'ready', 'todo', 'done', 'archived'];
const STATUS_COLORS: Record<string, string> = {
  blocked: 'bg-red-100 text-red-700 border-red-200',
  ready: 'bg-blue-100 text-blue-700 border-blue-200',
  todo: 'bg-gray-100 text-gray-700 border-gray-200',
  done: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-gray-50 text-gray-400 border-gray-200',
  running: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const TABS = ['Tasks', 'Agents', 'Automations'] as const;
type Tab = typeof TABS[number];

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'bg-orange-100 text-orange-700',
  minimax: 'bg-purple-100 text-purple-700',
  openrouter: 'bg-blue-100 text-blue-700',
  openai: 'bg-green-100 text-green-700',
};

const STATUS_DOT: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  gray: 'bg-gray-300',
};

function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  } catch { return null; }
}

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
  const statusColor = data?.status_color || 'gray';
  const tasks = data?.tasks || [];
  const profileDetails = data?.profile_details || [];
  const cronJobs = data?.cron_jobs || [];
  const profiles = data?.profiles || [];
  const hasMcp = data?.has_mcp || false;

  const active = data?.active_tasks || 0;
  const done = data?.done_tasks || 0;
  const blocked = data?.blocked_tasks || 0;
  const total = data?.board?.total || 0;

  // Group tasks by status
  const grouped: Record<string, Task[]> = {};
  STATUS_ORDER.forEach(s => { grouped[s] = []; });
  tasks.forEach((t) => {
    const s = t.status?.toLowerCase() || 'todo';
    if (grouped[s]) grouped[s].push(t);
    else {
      if (!grouped[s]) grouped[s] = [];
      grouped[s].push(t);
    }
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
      {/* Header */}
      <div className="mb-6 pb-4 border-b-2 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Clients</Link>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ring-2 ring-offset-1 ${STATUS_DOT[statusColor] || 'bg-gray-300'} ${
                statusColor === 'green' ? 'ring-green-200' : statusColor === 'yellow' ? 'ring-yellow-200' : 'ring-gray-200'
              }`} />
              <h1 className="text-2xl font-bold text-gray-900">{clientName}</h1>
              {hasMcp && (
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">MCP</span>
              )}
            </div>
            {/* Assigned profiles */}
            {profiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profiles.map(p => (
                  <span key={p} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
          <RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Active Tasks" value={active} variant={active > 0 ? 'blue' : 'default'} />
        <StatCard label="Done" value={done} variant="green" />
        <StatCard
          label="Blocked"
          value={blocked}
          variant={blocked > 0 ? 'alert' : 'default'}
          alertLabel={blocked > 0 ? 'attention' : undefined}
        />
        <StatCard label="Agents" value={profileDetails.length} variant="default" />
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
            {tab === 'Agents' && profileDetails.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({profileDetails.length})</span>
            )}
            {tab === 'Automations' && cronJobs.length > 0 && (
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
                    <div className="space-y-1.5">
                      {statusTasks.map((task, i) => {
                        const blockedDays = status === 'blocked' ? daysSince(task.created_at) : null;
                        return (
                          <div
                            key={task.id || i}
                            className={`p-3 rounded-md border text-sm ${
                              status === 'blocked'
                                ? 'border-l-[3px] border-l-red-500 border-red-200 bg-red-50/60'
                                : status === 'done'
                                ? 'border-gray-200 bg-gray-50/50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-900 leading-snug">{task.title}</span>
                                {task.body && (
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.body}</p>
                                )}
                              </div>
                              <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[0.6rem] font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
                                {status}
                              </span>
                            </div>
                            <div className="text-[0.65rem] text-gray-400 mt-1.5 flex flex-wrap gap-3 items-center">
                              {task.assignee && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                                  ● {task.assignee}
                                </span>
                              )}
                              {task.created_at && <span>Created {formatDate(task.created_at)}</span>}
                              {task.started_at && <span>Started {formatDate(task.started_at)}</span>}
                              {blockedDays !== null && blockedDays > 0 && (
                                <span className="text-red-500 font-semibold">
                                  ⚠ blocked {blockedDays}d
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
          {profileDetails.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profileDetails.map((agent, i) => {
                const providerStyle = PROVIDER_COLORS[agent.provider] || 'bg-gray-100 text-gray-600';
                return (
                  <div key={agent.name || i} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${agent.sessions_count > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm font-semibold text-gray-900">{agent.name}</span>
                      {agent.has_soul && (
                        <span className="text-[0.6rem] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded" title="Has SOUL.md">♦ Soul</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {agent.model && (
                        <span className={`text-[0.65rem] px-1.5 py-0.5 rounded font-medium ${providerStyle}`}>
                          {agent.model}
                        </span>
                      )}
                      {agent.provider && (
                        <span className="text-[0.6rem] text-gray-400">{agent.provider}</span>
                      )}
                    </div>
                    {/* Activity stats */}
                    <div className="flex gap-4 text-[0.65rem] text-gray-500 border-t border-gray-100 pt-2">
                      <span>{agent.sessions_count} sessions</span>
                      {agent.mcp_servers_count > 0 && (
                        <span>{agent.mcp_servers_count} MCP server{agent.mcp_servers_count !== 1 ? 's' : ''}</span>
                      )}
                      {agent.latest_session && (
                        <span className="ml-auto text-gray-400">Last: {agent.latest_session.substring(0, 10)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
              <p className="text-gray-400">No agents assigned to this client</p>
              <p className="text-xs text-gray-400 mt-1">Configure profiles in clients.json</p>
            </div>
          )}
        </div>
      )}

      {/* Automations tab */}
      {activeTab === 'Automations' && (
        <div>
          {cronJobs.length > 0 ? (
            <Card title="Scheduled Jobs">
              <div className="space-y-1.5">
                {cronJobs.map((job, i) => (
                  <div key={job.id || i} className="flex items-center justify-between p-3 rounded-md border border-gray-200 bg-white text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${job.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="font-medium text-gray-900">{job.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[0.65rem] text-gray-400">
                        <span className="font-mono">{job.schedule}</span>
                        {job.profile && <span>profile: {job.profile}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {job.last_run && (
                        <span className="text-[0.65rem] text-gray-400">{timeAgo(job.last_run)}</span>
                      )}
                      {job.last_status && (
                        <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-medium ${
                          job.last_status === 'success' ? 'bg-green-100 text-green-700' :
                          job.last_status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {job.last_status}
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-medium ${
                        job.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {job.enabled ? 'active' : 'paused'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
              <p className="text-gray-400">No automations for this client</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
