// lib/utils/time.ts - Shared time utilities

export function timeAgo(ts: string | number): string {
  if (!ts) return 'N/A';
  
  let date: Date;
  if (typeof ts === 'number') {
    date = new Date(ts);
  } else {
    date = new Date(ts.includes('_') ? ts.replace(/_/g, ' ') : ts);
  }
  
  if (isNaN(date.getTime())) return typeof ts === 'string' ? ts.substring(0, 12) : 'N/A';
  
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function getMcpStatus(lastPing: number) {
  const diff = Date.now() - lastPing;
  if (diff < 60000) return { dot: 'bg-green-500', label: 'Connected', bg: 'bg-green-100', text: 'text-green-800' };
  if (diff < 300000) return { dot: 'bg-yellow-500', label: 'Slow', bg: 'bg-yellow-100', text: 'text-yellow-800' };
  return { dot: 'bg-red-500', label: 'Disconnected', bg: 'bg-red-100', text: 'text-red-700' };
}
