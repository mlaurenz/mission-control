'use client';
export const dynamic = 'force-dynamic';
// app/system/page.tsx - Consolidated system/infrastructure page
// Absorbs: old system, agents, profiles, sessions, skills, activity

import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { timeAgo } from '../../lib/utils/time';
import { categorizeSkills, CAT_LABELS } from '../../lib/utils/skills';
import { useState } from 'react';

interface SystemPageData {
  health: any;
  gateway: any;
  mcp: any;
  codeStats: any;
  profiles: any;
  sessions: any;
  skills: any;
}

function parseGatewayStatus(raw: string | undefined) {
  if (!raw) return null;
  const result: {
    status: string; uptime: string; memory: string; cpu: string;
    processes: string[]; warnings: string[];
  } = { status: 'unknown', uptime: '', memory: '', cpu: '', processes: [], warnings: [] };

  const lines = raw.split('\n');
  for (const line of lines) {
    if (line.includes('Active:')) {
      const m = line.match(/Active:\s*(\S+\s*\(\S+\))/);
      if (m) result.status = m[1];
      else { const s = line.match(/Active:\s*(\S+)/); if (s) result.status = s[1]; }
      const since = line.match(/since\s+(.+)/);
      if (since) result.uptime = since[1].trim().replace(/;.*/, '').trim();
    }
    if (line.includes('Memory:')) { const m = line.match(/Memory:\s*(.+)/); if (m) result.memory = m[1].trim(); }
    if (line.includes('CPU:')) { const m = line.match(/CPU:\s*(.+)/); if (m) result.cpu = m[1].trim(); }
    if (line.match(/[├└─│].*\d/)) result.processes.push(line.trim());
    if (/warn|error/i.test(line) && !line.includes('Active:') && !line.includes('CGroup')) result.warnings.push(line.trim());
  }
  return result;
}

const SECTIONS = ['Health', 'Profiles', 'Sessions', 'Skills'] as const;
type Section = typeof SECTIONS[number];

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'bg-orange-100 text-orange-700',
  minimax: 'bg-purple-100 text-purple-700',
  openrouter: 'bg-blue-100 text-blue-700',
  openai: 'bg-green-100 text-green-700',
};

export default function SystemPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<SystemPageData>({
    url: '/api/system',
    interval: 15000,
  });

  const [expanded, setExpanded] = useState<Set<Section>>(new Set<Section>(['Health']));

  const health = data?.health || { status: 'unknown', timestamp: '' };
  const gatewayRaw = data?.gateway?.raw;
  const gateway = parseGatewayStatus(gatewayRaw);
  const mcp = data?.mcp || { servers: [] };
  const codeStats = data?.codeStats?.code_stats || [];
  const profiles = data?.profiles?.profiles || [];
  const activeProfile = data?.profiles?.active_profile || '';
  const sessions = data?.sessions?.sessions || [];
  const skillList = data?.skills?.skills || [];
  const categorized = categorizeSkills(skillList);

  const toggle = (s: Section) => {
    setExpanded(prev => {
      const next = new Set<Section>(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

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
        title="Infrastructure"
        subtitle="System health, profiles, sessions, and tools"
        status={health.status === 'healthy' ? 'online' : 'offline'}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* ─── Health & Gateway ─── */}
      <section className="mb-4">
        <button onClick={() => toggle('Health')} className="w-full text-left flex items-center justify-between py-2 cursor-pointer">
          <h2 className="text-sm font-semibold text-gray-900">Health & Gateway</h2>
          <span className="text-xs text-gray-400">{expanded.has('Health') ? '▲' : '▼'}</span>
        </button>
        {expanded.has('Health') && (
          <div className="space-y-3">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-[0.65rem] text-gray-500 uppercase">Service</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-semibold text-gray-900">{health.status}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-[0.65rem] text-gray-500 uppercase">Uptime</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{gateway?.uptime || '—'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-[0.65rem] text-gray-500 uppercase">Memory</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{gateway?.memory || '—'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-[0.65rem] text-gray-500 uppercase">CPU</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{gateway?.cpu || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Processes */}
              {gateway?.processes && gateway.processes.length > 0 && (
                <Card title="Process Tree">
                  <div className="space-y-0.5 font-mono text-xs">
                    {gateway.processes.map((p: string, i: number) => (
                      <div key={i} className="text-gray-600 bg-white px-2 py-1 rounded border border-gray-100">{p}</div>
                    ))}
                  </div>
                </Card>
              )}

              {/* MCP */}
              <Card title="MCP Servers" titleRight={<span className="text-xs text-gray-400">{mcp.servers?.length || 0}</span>}>
                {mcp.servers?.length > 0 ? (
                  <div className="space-y-1">
                    {mcp.servers.map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-white rounded border border-gray-100">
                        <span className={`w-2 h-2 rounded-full ${s.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm text-gray-900">{s.name || 'Unknown'}</span>
                        <span className={`text-[0.6rem] px-1.5 py-0.5 rounded ${s.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                          {s.enabled ? 'on' : 'off'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-400 text-center py-4 text-sm">No MCP servers</p>}
              </Card>
            </div>

            {/* Code stats */}
            {codeStats.length > 0 && (
              <Card title="Codebase" titleRight={
                <span className="text-xs text-gray-400">
                  {codeStats.reduce((a: number, p: any) => a + (p.lines || 0), 0).toLocaleString()} lines
                </span>
              }>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {codeStats.map((p: any, i: number) => (
                    <div key={i} className="bg-white p-2 rounded border border-gray-100">
                      <p className="font-medium text-gray-900">{p.project}</p>
                      <p className="text-xs text-gray-500">{p.files} files · {p.lines?.toLocaleString()} lines</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {gateway?.warnings && gateway.warnings.length > 0 && (
              <Card title="Warnings" variant="yellow">
                <div className="space-y-1">
                  {gateway.warnings.map((w: string, i: number) => (
                    <div key={i} className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1.5 rounded border border-yellow-200">{w}</div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </section>

      <hr className="border-gray-200 mb-4" />

      {/* ─── Profiles ─── */}
      <section className="mb-4">
        <button onClick={() => toggle('Profiles')} className="w-full text-left flex items-center justify-between py-2 cursor-pointer">
          <h2 className="text-sm font-semibold text-gray-900">Profiles ({profiles.length})</h2>
          <div className="flex items-center gap-2">
            {activeProfile && <span className="text-xs text-green-600 font-medium">active: {activeProfile}</span>}
            <span className="text-xs text-gray-400">{expanded.has('Profiles') ? '▲' : '▼'}</span>
          </div>
        </button>
        {expanded.has('Profiles') && (
          <div className="space-y-1.5 mt-2">
            {profiles.map((p: any) => {
              const providerStyle = PROVIDER_COLORS[p.provider] || 'bg-gray-100 text-gray-600';
              return (
                <div key={p.name} className={`flex items-center gap-3 p-3 rounded-lg border ${p.is_active ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                  <span className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-green-500' : p.sessions_count > 0 ? 'bg-blue-400' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                      {p.is_active && <span className="text-[0.6rem] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-semibold uppercase">Active</span>}
                      {p.has_soul && <span className="text-[0.6rem] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">♦ Soul</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.model && <span className={`text-[0.6rem] px-1.5 py-0.5 rounded font-medium ${providerStyle}`}>{p.model}</span>}
                      {p.provider && <span className="text-[0.6rem] text-gray-400">{p.provider}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 text-right flex-shrink-0">
                    {p.sessions_count > 0 && <div>{p.sessions_count} sessions</div>}
                    {p.logs?.total_size_kb > 0 && <div>{p.logs.total_size_kb >= 1024 ? `${(p.logs.total_size_kb / 1024).toFixed(1)}MB` : `${p.logs.total_size_kb}KB`} logs</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <hr className="border-gray-200 mb-4" />

      {/* ─── Sessions ─── */}
      <section className="mb-4">
        <button onClick={() => toggle('Sessions')} className="w-full text-left flex items-center justify-between py-2 cursor-pointer">
          <h2 className="text-sm font-semibold text-gray-900">Sessions ({sessions.length})</h2>
          <span className="text-xs text-gray-400">{expanded.has('Sessions') ? '▲' : '▼'}</span>
        </button>
        {expanded.has('Sessions') && (
          <div className="space-y-1 mt-2">
            {sessions.length > 0 ? sessions.slice(0, 20).map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-md border border-gray-200">
                <span className="text-sm text-gray-900 truncate mr-3">{s.title || 'Untitled'}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">{timeAgo(s.last_active)}</span>
              </div>
            )) : <p className="text-gray-400 text-center py-6 text-sm">No sessions</p>}
          </div>
        )}
      </section>

      <hr className="border-gray-200 mb-4" />

      {/* ─── Skills ─── */}
      <section className="mb-4">
        <button onClick={() => toggle('Skills')} className="w-full text-left flex items-center justify-between py-2 cursor-pointer">
          <h2 className="text-sm font-semibold text-gray-900">Skills ({skillList.length})</h2>
          <span className="text-xs text-gray-400">{expanded.has('Skills') ? '▲' : '▼'}</span>
        </button>
        {expanded.has('Skills') && (
          <div className="space-y-2 mt-2">
            {Object.keys(categorized).sort().map(cat => (
              <div key={cat} className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-900">{CAT_LABELS[cat] || cat}</span>
                  <span className="bg-gray-200 text-gray-600 text-[0.6rem] px-1.5 py-0.5 rounded-full font-medium">{categorized[cat].length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categorized[cat].map((s: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
