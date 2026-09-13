'use client';
// app/components/RefreshIndicator.tsx - Shows last refresh time + manual refresh
import { useCallback } from 'react';

interface RefreshIndicatorProps {
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function RefreshIndicator({ lastUpdated, loading, onRefresh }: RefreshIndicatorProps) {
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      {loading && (
        <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      )}
      <span>Updated: {timeStr}</span>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="text-blue-500 hover:text-blue-700 disabled:opacity-50 transition-colors"
        title="Refresh now"
      >
        ↻
      </button>
    </div>
  );
}
