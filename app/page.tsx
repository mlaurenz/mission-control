// app/page.tsx - Mission Control Dashboard (Clean Style)
import { getHealth, getSessions, getCron, getKanbanBoards, getKanbanTasks, getSkills } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

// Hardcoded profiles
const PROFILES = [
  { name: 'default', model: 'MiniMax-M2', status: 'active' },
  { name: 'automation', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'coder', model: 'openai/gpt-5.6-sol', status: 'stopped' },
  { name: 'consultant', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'creator', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'designer', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'editor', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'orchestrator', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'pm', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'research', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'social', model: 'MiniMax-M2', status: 'stopped' },
];

// MCP agents with lastPing
const MCP_AGENTS = [
  { enabled: true, name: 'octopush', status: 'enabled', tools: 'all', transport: 'https://octopushon.us/api', lastPing: Date.now() - 30000 },
  { enabled: true, name: 'open-design', status: 'enabled', tools: 'all', transport: '/root/.hermes/node/bin/no...', lastPing: Date.now() - 5000 }
];

// Skill category mapping
const SKILL_CAT_MAP: Record<string, string> = {
  'social-media': 'social-media',
  'xurl': 'social-media',
  'gif-search': 'media',
  'songsee': 'media',
  'youtube-content': 'media',
  'manim-video': 'creative',
  'p5js': 'creative',
  'ascii-video': 'creative',
  'architecture-diagram': 'creative',
  'claude-design': 'creative',
  'popular-web-designs': 'creative',
  'songwriting-and-ai-music': 'creative',
  'baoyu-infographic': 'creative',
  'design-md': 'creative',
  'humanizer': 'creative',
  'obsidian': 'note-taking',
  'arxiv': 'research',
  'competitor-news-monitor': 'research',
  'grounded-citations': 'research',
  'llm-wiki': 'research',
  'airtable': 'productivity',
  'box': 'productivity',
  'docx': 'productivity',
  'google-workspace': 'productivity',
  'maps': 'productivity',
  'notion': 'productivity',
  'pdf': 'productivity',
  'powerpoint': 'productivity',
  'xlsx': 'productivity',
  'product-price-monitor': 'productivity',
  'teams-meeting-pipeline': 'productivity',
  'weekly-review-planning': 'productivity',
  'meeting-action-items': 'productivity',
  'document-to-action-items': 'productivity',
  'mcp-integration': 'devops',
  'hermes-agent': 'devops',
  'email': 'email',
  'email-inbox-triage': 'email',
  'himalaya': 'email',
  'web': 'web',
  'blocked-page-recovery': 'web',
  'github': 'software-development',
  'claude-code': 'software-development',
  'codex': 'software-development',
  'computer-use': 'software-development',
  'dogfood': 'software-development',
  'node-inspect-debugger': 'software-development',
  'opencode': 'software-development',
  'python-debugpy': 'software-development',
  'requesting-code-review': 'software-development',
  'simplify-code': 'software-development',
  'spike': 'software-development',
  'systematic-debugging': 'software-development',
  'test-driven-development': 'software-development',
  'codebase-inspection': 'software-development',
  'autonomous-ai-agents': 'autonomous-ai-agents',
};

const CAT_LABELS: Record<string, string> = {
  'social-media': '📱 social-media',
  'media': '🎬 media',
  'creative': '🎨 creative',
  'note-taking': '📓 note-taking',
  'research': '🔬 research',
  'productivity': '🧩 productivity',
  'devops': '⚙️ devops',
  'email': '📧 email',
  'web': '🌐 web',
  'software-development': '💻 software-development',
  'autonomous-ai-agents': '🤖 autonomous-ai-agents',
  'other': '📦 other',
};

// Helper: relative time
function timeAgo(ts: string): string {
  if (!ts) return 'N/A';
  const date = new Date(ts.includes('_') ? ts.replace(/_/g, ' ') : ts);
  if (isNaN(date.getTime())) return ts.substring(0, 12);
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

// Helper: MCP status color
function getMcpStatus(lastPing: number) {
  const diff = Date.now() - lastPing;
  if (diff < 60000) return { dot: '#16a34a', label: 'Connected', bg: '#dcfce7', text: '#166534' };
  if (diff < 300000) return { dot: '#d97706', label: 'Slow', bg: '#fef3c7', text: '#92400e' };
  return { dot: '#dc2626', label: 'Disconnected', bg: '#fee2e2', text: '#dc2626' };
}

export default async function Home() {
  let health = { status: 'unknown', timestamp: '' };
  let sessions = { sessions: [] };
  let cron = { cron_jobs: [] };
  let kanbanBoards = { boards: [] };
  let kanbanTasks = { tasks: [] };
  let skills = { skills: [] };

  const fetchWithErr = async (fn: () => Promise<any>, setter: any) => {
    try { setter(await fn()); } catch (e) { console.error(e); }
  };

  await Promise.all([
    fetchWithErr(getHealth, (v: any) => health = v),
    fetchWithErr(getSessions, (v: any) => sessions = v),
    fetchWithErr(getCron, (v: any) => cron = v),
    fetchWithErr(getKanbanBoards, (v: any) => kanbanBoards = v),
    fetchWithErr(getKanbanTasks, (v: any) => kanbanTasks = v),
    fetchWithErr(getSkills, (v: any) => skills = v),
  ]);

  // Aggregate task counts
  const taskCounts: Record<string, number> = { todo: 0, ready: 0, running: 0, blocked: 0, review: 0, done: 0 };
  kanbanTasks.tasks?.forEach((t: any) => {
    const status = t.status?.toLowerCase() || 'todo';
    if (taskCounts[status] !== undefined) taskCounts[status]++;
  });

  // Recent sessions
  const recentSessions = sessions.sessions?.slice(0, 8) || [];

  // Board done/total map
  const boardStats: Record<string, { done: number; total: number }> = {};
  kanbanTasks.tasks?.forEach((t: any) => {
    const board = t.board?.name || t.boardName || 'unknown';
    if (!boardStats[board]) boardStats[board] = { done: 0, total: 0 };
    boardStats[board].total++;
    if (t.status?.toLowerCase() === 'done') boardStats[board].done++;
  });

  // Categorize skills
  const categorized: Record<string, string[]> = {};
  const uncategorized: string[] = [];
  (skills.skills || []).forEach((s: string) => {
    const cat = SKILL_CAT_MAP[s.toLowerCase()] || 'other';
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(s);
  });
  if (uncategorized.length) categorized['other'] = uncategorized;

  const sortedCats = Object.keys(categorized).sort();

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', padding: '2rem' }}>

      {/* Floating Quick-Add Button */}
      <a href="/kanban" title="Add Task" style={{
        position: 'fixed', bottom: '2rem', right: '2rem',
        background: '#1a1a1a', color: '#fff', borderRadius: '50%',
        width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)', zIndex: 100,
        fontSize: '1.5rem', textDecoration: 'none', fontWeight: 300
      }}>+</a>

      {/* Header */}
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>Mission Control</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Hermes Operations Dashboard</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '6px',
              background: health.status === 'healthy' ? '#dcfce7' : '#fee2e2',
              color: health.status === 'healthy' ? '#166534' : '#dc2626',
              fontSize: '0.85rem', fontWeight: 600
            }}>
              {health.status === 'healthy' ? '● Online' : '● Offline'}
            </span>
            <p style={{ margin: '0.5rem 0 0', color: '#999', fontSize: '0.75rem' }}>
              {health.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>

          <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '8px', border: '2px solid #86efac', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#166534', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Active Model</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.2rem', color: '#166534', fontWeight: 700 }}>MiniMax-M2</p>
          </div>

          <div style={{ background: '#fef3c7', padding: '1.25rem', borderRadius: '8px', border: '2px solid #fbbf24', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#92400e', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Profiles</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.2rem', color: '#92400e', fontWeight: 700 }}>{PROFILES.length}</p>
          </div>

          <div style={{ background: '#f0f9ff', padding: '1.25rem', borderRadius: '8px', border: '2px solid #7dd3fc', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#0369a1', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>MCP Agents</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.2rem', color: '#0369a1', fontWeight: 700 }}>{MCP_AGENTS.length}</p>
          </div>

          <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Tasks</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>{kanbanTasks.tasks?.length || 0}</p>
          </div>

          <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#1e40af', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Ready</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#1e40af', fontWeight: 700 }}>{taskCounts.ready}</p>
          </div>

          {/* Blocked */}
          <div style={{
            background: '#fef2f2', padding: '1.25rem', borderRadius: '8px',
            border: '3px solid #dc2626', textAlign: 'center',
            boxShadow: taskCounts.blocked > 0 ? '0 0 0 1px #dc2626, 0 4px 12px rgba(220,38,38,0.15)' : 'none',
            animation: taskCounts.blocked > 0 ? 'blockedPulse 2s ease-in-out infinite' : 'none',
            position: 'relative'
          }}>
            {taskCounts.blocked > 0 && (
              <span style={{
                position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                background: '#dc2626', color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>⚠ Alert</span>
            )}
            <p style={{ margin: taskCounts.blocked > 0 ? '0.5rem 0 0' : 0, color: '#dc2626', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>⚡ Blocked</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2.5rem', color: '#dc2626', fontWeight: 800 }}>{taskCounts.blocked}</p>
            <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.7rem', fontWeight: 600 }}>needs attention</p>
          </div>

          {taskCounts.running > 0 && (
            <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fde68a', textAlign: 'center', opacity: 0.7 }}>
              <p style={{ margin: 0, color: '#d97706', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Running</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#d97706', fontWeight: 700 }}>{taskCounts.running}</p>
              <p style={{ margin: 0, color: '#fbbf24', fontSize: '0.7rem' }}>in progress</p>
            </div>
          )}

          {taskCounts.done > 0 && (
            <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center', opacity: 0.7 }}>
              <p style={{ margin: 0, color: '#16a34a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Done</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#16a34a', fontWeight: 700 }}>{taskCounts.done}</p>
              <p style={{ margin: 0, color: '#4ade80', fontSize: '0.7rem' }}>completed</p>
            </div>
          )}
        </div>
      </section>

      {/* Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Recent Sessions */}
        <section style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <h2 style={{ fontSize: '1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Recent Sessions</h2>
          <div style={{ maxHeight: '280px', overflow: 'auto' }}>
            {recentSessions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentSessions.map((s: any, i: number) => (
                  <div key={i} style={{
                    padding: '0.75rem', background: '#fff', borderRadius: '6px', border: '1px solid #e5e5e5',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#1a1a1a' }}>{s.title?.substring(0, 35) || 'Untitled'}</span>
                    <span style={{ fontSize: '0.7rem', color: '#666', background: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {timeAgo(s.last_active)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No sessions</p>
            )}
          </div>
        </section>

        {/* Cron Jobs */}
        <section style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <h2 style={{ fontSize: '1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Scheduled Jobs</h2>
          <div style={{ maxHeight: '280px', overflow: 'auto' }}>
            {cron.cron_jobs && cron.cron_jobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cron.cron_jobs.map((c: any, i: number) => (
                  <div key={i} style={{
                    padding: '0.75rem', background: '#fff', borderRadius: '6px', border: '1px solid #e5e5e5',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#1a1a1a' }}>{c.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'monospace' }}>{c.schedule}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏰</div>
                <p style={{ color: '#999', marginBottom: '1rem' }}>No scheduled jobs yet</p>
                <a href="/schedule" style={{
                  display: 'inline-block', background: '#1a1a1a', color: '#fff',
                  padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem',
                  textDecoration: 'none', fontWeight: 500
                }}>Schedule your first job →</a>
              </div>
            )}
          </div>
        </section>

        {/* Kanban Boards */}
        <section style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <h2 style={{ fontSize: '1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Kanban Boards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {kanbanBoards.boards?.map((b: any, i: number) => {
              const stats = boardStats[b.name] || { done: 0, total: b.total || 0 };
              const pct = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
              const barColor = pct === 100 ? '#16a34a' : pct > 50 ? '#d97706' : '#dc2626';
              return (
                <div key={i} style={{ padding: '0.75rem', background: '#fff', borderRadius: '6px', border: '1px solid #e5e5e5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#1a1a1a', fontWeight: 500 }}>{b.name}</p>
                    <span style={{ fontSize: '0.7rem', color: '#666', background: '#f0f0f0', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>{stats.total}</span>
                  </div>
                  <div style={{ background: '#e5e5e5', borderRadius: '3px', height: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '3px', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#999' }}>Done: {stats.done}</span>
                    <span style={{ fontSize: '0.65rem', color: '#999' }}>{Math.round(pct)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Skills */}
        <section style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <h2 style={{ fontSize: '1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Installed Skills</h2>
          <div style={{ maxHeight: '320px', overflow: 'auto' }}>
            {sortedCats.map(cat => (
              <details key={cat} style={{ border: '1px solid #e5e5e5', borderRadius: '6px', marginBottom: '0.4rem', padding: '0.5rem 0.75rem', background: '#fff' }}>
                <summary style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', cursor: 'pointer', userSelect: 'none' }}>
                  {CAT_LABELS[cat] || cat} ({categorized[cat].length})
                </summary>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {categorized[cat].map((s: string, i: number) => (
                    <span key={i} style={{ padding: '0.2rem 0.55rem', background: '#f0f0f0', borderRadius: '4px', fontSize: '0.75rem', color: '#333' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* MCP Agents */}
        <section style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', border: '2px solid #7dd3fc' }}>
          <h2 style={{ fontSize: '1rem', color: '#0369a1', marginBottom: '1rem', fontWeight: 600 }}>🤖 MCP Agents</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {MCP_AGENTS.map((agent: any, i: number) => {
              const st = getMcpStatus(agent.lastPing || Date.now());
              return (
                <div key={i} style={{
                  padding: '0.75rem', background: '#fff', borderRadius: '6px', border: '1px solid #7dd3fc',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0369a1' }}>{agent.name}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                    <span style={{ fontSize: '0.7rem', color: st.text, background: st.bg, padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                      {st.label}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#999' }}>
                      {timeAgo(new Date(agent.lastPing).toISOString())}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Profiles */}
        <section style={{ background: '#fef3c7', padding: '1.5rem', borderRadius: '8px', border: '2px solid #fbbf24' }}>
          <h2 style={{ fontSize: '1rem', color: '#92400e', marginBottom: '1rem', fontWeight: 600 }}>👤 Profiles ({PROFILES.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {PROFILES.map((profile: any, i: number) => (
              <div key={i} style={{
                padding: '0.5rem', background: '#fff', borderRadius: '6px',
                border: profile.status === 'active' ? '2px solid #16a34a' : '1px solid #fbbf24',
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: profile.status === 'active' ? '#16a34a' : '#92400e' }}>
                  {profile.status === 'active' ? '●' : '○'} {profile.name}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  color: profile.status === 'active' ? '#16a34a' : '#999',
                  background: profile.status === 'active' ? '#dcfce7' : '#f0f0f0',
                  padding: '0.1rem 0.4rem', borderRadius: '3px', marginLeft: '0.35rem', fontWeight: 600
                }}>
                  {profile.status === 'active' ? 'active' : 'inactive'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#666', display: 'block', marginTop: '0.1rem' }}>{profile.model}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
