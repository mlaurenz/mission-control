'use client';
// app/components/useAutoRefresh.ts - Custom hook for auto-refresh polling
import { useState, useEffect, useCallback } from 'react';

interface UseAutoRefreshOptions {
  url: string;
  interval?: number; // ms, default 10s
  enabled?: boolean;
}

export function useAutoRefresh<T>({ url, interval = 10000, enabled = true }: UseAutoRefreshOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData(); // initial fetch
    if (!enabled) return;
    const id = setInterval(fetchData, interval);
    return () => clearInterval(id);
  }, [fetchData, interval, enabled]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}
