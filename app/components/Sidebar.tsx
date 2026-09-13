'use client';
// app/components/Sidebar.tsx - Responsive sidebar with active state
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: '◉' },
  { href: '/kanban', label: 'Projects', icon: '◧' },
  { href: '/tasks', label: 'Tasks', icon: '☰' },
  { href: '/activity', label: 'Activity', icon: '⚡' },
  { href: '/sessions', label: 'Sessions', icon: '▤' },
  { href: '/schedule', label: 'Schedule', icon: '◔' },
  { href: '/system', label: 'System', icon: '⚙' },
  { href: '/skills', label: 'Skills', icon: '◈' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP;

  const deployLabel = (() => {
    const parts: string[] = [];
    if (commitSha) parts.push(`v${commitSha.substring(0, 7)}`);
    if (buildTime) {
      try {
        const d = new Date(buildTime);
        parts.push(d.toLocaleString('en-US', {
          day: '2-digit', month: '2-digit',
          hour: '2-digit', minute: '2-digit',
        }));
      } catch {}
    }
    return parts.join(' · ') || 'dev';
  })();

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-gray-200 rounded-lg p-2 shadow-md"
        aria-label="Toggle menu"
      >
        <span className="text-lg">{open ? '✕' : '☰'}</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        fixed top-0 left-0 h-full w-56 bg-gray-50 border-r border-gray-200
        flex flex-col z-40
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Mission Control</h1>
          <p className="text-xs text-gray-500 mt-0.5">Hermes Observability</p>
          <p className="text-[0.65rem] text-gray-400 font-mono mt-1">
            {deployLabel}
          </p>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-2 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium mb-0.5
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                  }
                `}
              >
                <span className="text-sm w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 text-xs text-gray-400">
          Hermes Bridge · v1.0
        </div>
      </nav>
    </>
  );
}
