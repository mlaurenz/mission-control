'use client';
export const dynamic = 'force-dynamic';
// app/profiles/page.tsx — Hermes Profiles with real data from bridge /profiles endpoint

import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { useState, useEffect } from 'react';

interface ProfileLog { source: string; line: string }
interface ProfileData {
  name: string;
  is_active: boolean;
  model: string;
  provider: string;
  fallback_provider: string;
  fallback_model: string;
  reasoning_effort: string;
  max_turns: number;
  kanban_config: Record<string, any>;
  has_soul: boolean;
  sessions_count: number;
  latest_session: string | null;
  logs: { files: { name: string; size_kb: number }[]; total_size_kb: number };
}

interface ProfilesResponse {
  profiles: ProfileData[];
  active_profile: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'bg-orange-100 text-orange-700',
  minimax: 'bg-purple-100 text-purple-700',
  openrouter: 'bg-blue-100 text-blue-700',
};

function LogViewer({ profileName }: { profileName: string }) {
  const [logs, setLogs] = useState<ProfileLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/profiles/${profileName}/logs`)
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [profileName]);

  const filtered = filter === 'all' ? logs
    : filter === 'errors' ? logs.filter(l => l.line.includes('ERROR') || l.line.includes('CRITICAL') || l.source === 'errors')
    : filter === 'warnings' ? logs.filter(l => l.line.includes('WARNING') || l.line.includes('ERROR'))
    : logs.filter(l => l.source === filter);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (logs.length === 0) {
    return <div className="p-6 text-center text-gray-400 text-sm">No log entries for this profile</div>;
  }

  const sources = Array.from(new Set(logs.map(l => l.source)));

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50/50">
        {['all', 'errors', 'warnings', ...sources].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded text-[0.65rem] font-medium transition-colors cursor-pointer capitalize
              ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >{f}</button>
        ))}
        <span className="ml-auto text-[0.65rem] text-gray-400 self-center">{filtered.length} entries</span>
      </div>

      {/* Entries */}
      <div className="max-h-80 overflow-auto">
        {filtered.length > 0 ? filtered.map((log, i) => {
          const isError = log.line.includes('ERROR') || log.line.includes('CRITICAL') || log.source === 'errors';
          const isWarning = log.line.includes('WARNING');
          return (
            <div key={i} className={`px-4 py-1.5 border-l-2 text-[0.7rem] font-mono leading-relaxed break-all
              ${isError ? 'border-l-red-500 bg-red-50/50 text-red-800'
                : isWarning ? 'border-l-yellow-400 bg-yellow-50/30 text-yellow-800'
                : 'border-l-gray-200 text-gray-600'}
              ${i > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <span className="text-gray-400 mr-1.5">[{log.source}]</span>
              {log.line.length > 200 ? log.line.substring(0, 200) + '…' : log.line}
            </div>
          );
        }) : (
          <div className="p-6 text-center text-gray-400 text-sm">No entries match filter</div>
        )}
      </div>
    </div>
  );
}

export default function ProfilesPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<ProfilesResponse>({
    url: '/api/profiles',
    interval: 15000,
  });

  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);
  const [showLogsFor, setShowLogsFor] = useState<string | null>(null);

  const profiles = data?.profiles || [];
  const activeProfile = data?.active_profile || '';

  // Separate active/with-activity from idle
  const activeProfiles = profiles.filter(p => p.is_active || p.sessions_count > 0 || p.logs.total_size_kb > 0);
  const idleProfiles = profiles.filter(p => !p.is_active && p.sessions_count === 0 && p.logs.total_size_kb === 0);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading profiles...</p>
        </div>
      </div>
    );
  }

  function renderProfile(p: ProfileData) {
    const isExpanded = expandedProfile === p.name;
    const isShowingLogs = showLogsFor === p.name;
    const providerStyle = PROVIDER_COLORS[p.provider] || 'bg-gray-100 text-gray-600';

    return (
      <div key={p.name} className={`border rounded-lg overflow-hidden transition-shadow ${
        p.is_active ? 'border-green-400 bg-green-50/30' : 'border-gray-200 bg-white'
      }`}>
        {/* Header — clickable */}
        <button
          onClick={() => setExpandedProfile(isExpanded ? null : p.name)}
          className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
        >
          {/* Status dot */}
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            p.is_active ? 'bg-green-500' : p.sessions_count > 0 ? 'bg-blue-400' : 'bg-gray-300'
          }`} />

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">{p.name}</span>
              {p.is_active && (
                <span className="text-[0.6rem] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-semibold uppercase">Active</span>
              )}
              {p.has_soul && (
                <span className="text-[0.6rem] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded" title="Has SOUL.md personality">♦ Soul</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {p.model && (
                <span className={`text-[0.65rem] px-1.5 py-0.5 rounded font-medium ${providerStyle}`}>
                  {p.model}
                </span>
              )}
              {p.provider && (
                <span className="text-[0.6rem] text-gray-400">{p.provider}</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
            {p.sessions_count > 0 && (
              <span title="Sessions">{p.sessions_count} sessions</span>
            )}
            {p.logs.total_size_kb > 0 && (
              <span title="Log size">{p.logs.total_size_kb >= 1024
                ? `${(p.logs.total_size_kb / 1024).toFixed(1)}MB`
                : `${p.logs.total_size_kb}KB`
              } logs</span>
            )}
            <span className="text-gray-300">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </button>

        {/* Expanded details */}
        {isExpanded && (
          <div className="border-t border-gray-200">
            {/* Config grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200">
              <div className="bg-white px-3 py-2">
                <p className="text-[0.6rem] text-gray-400 uppercase">Model</p>
                <p className="text-xs font-medium text-gray-900">{p.model || '—'}</p>
              </div>
              <div className="bg-white px-3 py-2">
                <p className="text-[0.6rem] text-gray-400 uppercase">Provider</p>
                <p className="text-xs font-medium text-gray-900">{p.provider || '—'}</p>
              </div>
              <div className="bg-white px-3 py-2">
                <p className="text-[0.6rem] text-gray-400 uppercase">Reasoning</p>
                <p className="text-xs font-medium text-gray-900">{p.reasoning_effort || '—'}</p>
              </div>
              <div className="bg-white px-3 py-2">
                <p className="text-[0.6rem] text-gray-400 uppercase">Max Turns</p>
                <p className="text-xs font-medium text-gray-900">{p.max_turns || '—'}</p>
              </div>
              {p.fallback_model && (
                <div className="bg-white px-3 py-2 col-span-2">
                  <p className="text-[0.6rem] text-gray-400 uppercase">Fallback</p>
                  <p className="text-xs font-medium text-gray-900">{p.fallback_model} <span className="text-gray-400">({p.fallback_provider})</span></p>
                </div>
              )}
              {Object.keys(p.kanban_config || {}).length > 0 && (
                <div className="bg-white px-3 py-2 col-span-2">
                  <p className="text-[0.6rem] text-gray-400 uppercase">Kanban</p>
                  <p className="text-xs font-mono text-gray-700">
                    {Object.entries(p.kanban_config).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                </div>
              )}
            </div>

            {/* Log files summary */}
            {p.logs.files.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[0.65rem] text-gray-500 font-semibold uppercase">Log Files</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowLogsFor(isShowingLogs ? null : p.name); }}
                    className="text-[0.65rem] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    {isShowingLogs ? 'Hide logs' : 'View recent logs →'}
                  </button>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {p.logs.files.map((f, i) => (
                    <span key={i} className="text-[0.6rem] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">
                      {f.name} ({f.size_kb >= 1024 ? `${(f.size_kb/1024).toFixed(1)}M` : `${f.size_kb}K`})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Inline log viewer */}
            {isShowingLogs && (
              <div className="border-t border-gray-200">
                <LogViewer profileName={p.name} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profiles"
        subtitle={`${profiles.length} profiles · Active: ${activeProfile || 'none'}`}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-[0.65rem] text-gray-500 uppercase">Total Profiles</p>
          <p className="text-lg font-semibold text-gray-900">{profiles.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <p className="text-[0.65rem] text-green-700 uppercase">Active</p>
          <p className="text-lg font-semibold text-green-800">{activeProfile || '—'}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-[0.65rem] text-gray-500 uppercase">With Sessions</p>
          <p className="text-lg font-semibold text-gray-900">{profiles.filter(p => p.sessions_count > 0).length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-[0.65rem] text-gray-500 uppercase">Total Log Size</p>
          <p className="text-lg font-semibold text-gray-900">{
            (() => { const kb = profiles.reduce((s, p) => s + p.logs.total_size_kb, 0); return kb >= 1024 ? `${(kb/1024).toFixed(1)}MB` : `${kb}KB`; })()
          }</p>
        </div>
      </div>

      {/* Active / with activity profiles */}
      {activeProfiles.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs text-gray-500 uppercase font-semibold mb-2 tracking-wider">Active & With Activity</h2>
          <div className="space-y-2">
            {activeProfiles.map(renderProfile)}
          </div>
        </section>
      )}

      {/* Idle profiles */}
      {idleProfiles.length > 0 && (
        <section>
          <h2 className="text-xs text-gray-500 uppercase font-semibold mb-2 tracking-wider">Idle ({idleProfiles.length})</h2>
          <div className="space-y-2">
            {idleProfiles.map(renderProfile)}
          </div>
        </section>
      )}
    </div>
  );
}
