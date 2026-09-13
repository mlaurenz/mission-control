'use client';
export const dynamic = 'force-dynamic';
// app/activity/page.tsx - Live Activity: combined /activity + /logs
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { useState } from 'react';
import { timeAgo } from '../../lib/utils/time';

interface ActivityData {
  activity: any;
  logs: any;
}

type FilterType = 'all' | 'sessions' | 'warnings' | 'errors';

function parseLogLine(line: string): { timestamp: string; level: string; source: string; message: string } {
  // Try parsing: "2024-01-15 10:30:00 [INFO] source: message"
  const m = line.match(/^(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s*\[?(\w+)\]?\s*(?:(\S+?):\s*)?(.*)$/);
  if (m) return { timestamp: m[1], level: m[2].toLowerCase(), source: m[3] || '', message: m[4] };
  
  // Fallback: just detect level
  let level = 'info';
  if (/error/i.test(line)) level = 'error';
  else if (/warn/i.test(line)) level = 'warning';
  
  const ts = line.match(/\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/);
  return { timestamp: ts ? ts[0] : '', level, source: '', message: line };
}

export default function ActivityPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<ActivityData>({
    url: '/api/activity',
    interval: 5000,
  });

  const [filter, setFilter] = useState<FilterType>('all');

  const activityEvents = data?.activity?.activity || [];
  const logLines = data?.logs?.logs || [];

  // Build unified timeline
  const items: { id: number; type: 'event' | 'log'; text: string; time: string; level: string; source: string }[] = [];
  let idx = 0;
  
  activityEvents.forEach((a: any) => {
    items.push({
      id: idx++,
      type: 'event',
      text: a.description,
      time: a.timestamp || '',
      level: 'session',
      source: a.type || 'session',
    });
  });

  logLines.forEach((line: string) => {
    const parsed = parseLogLine(line);
    items.push({
      id: idx++,
      type: 'log',
      text: parsed.message || line,
      time: parsed.timestamp,
      level: parsed.level,
      source: parsed.source,
    });
  });

  // Sort newest first
  items.sort((a, b) => (b.time || '').localeCompare(a.time || ''));

  // Apply filter
  const filtered = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'sessions') return item.type === 'event';
    if (filter === 'warnings') return item.level === 'warning' || item.level === 'warn';
    if (filter === 'errors') return item.level === 'error';
    return true;
  });

  const errorCount = items.filter(i => i.level === 'error').length;
  const warnCount = items.filter(i => i.level === 'warning' || i.level === 'warn').length;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  function levelBadge(level: string) {
    const styles: Record<string, string> = {
      session: 'bg-blue-100 text-blue-600',
      info: 'bg-gray-100 text-gray-500',
      warning: 'bg-yellow-100 text-yellow-700',
      warn: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-600',
      debug: 'bg-gray-50 text-gray-400',
    };
    return styles[level] || 'bg-gray-100 text-gray-500';
  }

  function levelBorder(level: string) {
    if (level === 'error') return 'border-l-red-500';
    if (level === 'warning' || level === 'warn') return 'border-l-yellow-500';
    if (level === 'session') return 'border-l-blue-500';
    return 'border-l-gray-200';
  }

  return (
    <div>
      <PageHeader
        title="Activity"
        subtitle={`${items.length} events · Auto-refreshing every 5s`}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Summary + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          <span><span className="font-semibold text-gray-900">{activityEvents.length}</span> events</span>
          <span><span className="font-semibold text-gray-900">{logLines.length}</span> log lines</span>
          {errorCount > 0 && <span><span className="font-semibold text-red-600">{errorCount}</span> errors</span>}
          {warnCount > 0 && <span><span className="font-semibold text-yellow-600">{warnCount}</span> warnings</span>}
        </div>
        <div className="flex gap-1">
          {(['all', 'sessions', 'warnings', 'errors'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize
                ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map(item => (
              <div key={item.id} className={`px-4 py-2.5 border-l-2 ${levelBorder(item.level)} flex items-start gap-2.5`}>
                <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[0.6rem] uppercase font-medium ${levelBadge(item.level)}`}>
                  {item.level === 'session' ? 'session' : item.level}
                </span>
                {item.source && (
                  <span className="shrink-0 text-[0.65rem] text-gray-400 font-mono mt-0.5">{item.source}</span>
                )}
                <span className="flex-1 text-xs text-gray-700 leading-relaxed break-all">{item.text}</span>
                {item.time && (
                  <span className="shrink-0 text-[0.6rem] text-gray-400 whitespace-nowrap mt-0.5">{timeAgo(item.time)}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-12 text-sm">
            {filter !== 'all' ? `No ${filter} to display` : 'No activity data'}
          </p>
        )}
      </div>
    </div>
  );
}
