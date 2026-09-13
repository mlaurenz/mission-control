'use client';
// app/login/page.tsx — Minimal login with magic link support

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setError('');
    setLoading(true);

    // Navigate with token — middleware will validate and set cookie
    window.location.href = `/?token=${encodeURIComponent(token.trim())}`;
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-sm text-center">
        <div className="text-3xl mb-3">🎯</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Mission Control</h1>
        <p className="text-sm text-gray-500 mb-6">Hermes Observability</p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 mb-2">Access this dashboard using your magic link:</p>
          <code className="text-xs text-gray-400 break-all">
            https://...vercel.app<span className="text-blue-600">?token=YOUR_TOKEN</span>
          </code>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-400">or enter token manually</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent mb-3 text-center"
            placeholder="Paste your token"
            autoFocus
          />

          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>
    </main>
  );
}
