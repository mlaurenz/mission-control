// app/skills/page.tsx - Skills Page (Clean Style)
import { getSkills } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

const SKILL_CAT_MAP: Record<string, string> = {
  'social-media': 'social-media', 'xurl': 'social-media',
  'gif-search': 'media', 'songsee': 'media', 'youtube-content': 'media',
  'manim-video': 'creative', 'p5js': 'creative', 'ascii-video': 'creative',
  'architecture-diagram': 'creative', 'claude-design': 'creative',
  'popular-web-designs': 'creative', 'songwriting-and-ai-music': 'creative',
  'baoyu-infographic': 'creative', 'design-md': 'creative', 'humanizer': 'creative',
  'obsidian': 'note-taking',
  'arxiv': 'research', 'competitor-news-monitor': 'research',
  'grounded-citations': 'research', 'llm-wiki': 'research',
  'airtable': 'productivity', 'box': 'productivity', 'docx': 'productivity',
  'google-workspace': 'productivity', 'maps': 'productivity', 'notion': 'productivity',
  'pdf': 'productivity', 'powerpoint': 'productivity', 'xlsx': 'productivity',
  'product-price-monitor': 'productivity', 'teams-meeting-pipeline': 'productivity',
  'weekly-review-planning': 'productivity', 'meeting-action-items': 'productivity',
  'document-to-action-items': 'productivity',
  'mcp-integration': 'devops', 'hermes-agent': 'devops',
  'email': 'email', 'email-inbox-triage': 'email', 'himalaya': 'email',
  'web': 'web', 'blocked-page-recovery': 'web',
  'github': 'software-development', 'claude-code': 'software-development',
  'codex': 'software-development', 'computer-use': 'software-development',
  'dogfood': 'software-development', 'node-inspect-debugger': 'software-development',
  'opencode': 'software-development', 'python-debugpy': 'software-development',
  'requesting-code-review': 'software-development', 'simplify-code': 'software-development',
  'spike': 'software-development', 'systematic-debugging': 'software-development',
  'test-driven-development': 'software-development', 'codebase-inspection': 'software-development',
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

export default async function SkillsPage() {
  let skills = { skills: [] };
  try { skills = await getSkills(); } catch (e) {}

  const skillList = skills.skills || [];

  // Categorize
  const categorized: Record<string, string[]> = {};
  const uncategorized: string[] = [];
  skillList.forEach((s: string) => {
    const cat = SKILL_CAT_MAP[s.toLowerCase()] || 'other';
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(s);
  });
  if (uncategorized.length) categorized['other'] = uncategorized;

  const sortedCats = Object.keys(categorized).sort();
  const totalCategories = sortedCats.length;

  return (
    <main style={{ color: '#1a1a1a', background: '#ffffff' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>🔧 Skills</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Hermes skills installed</p>
      </header>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Skills</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>{skillList.length}</p>
        </div>
        <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <p style={{ margin: 0, color: '#1e40af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categories</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1e40af', fontWeight: 600 }}>{totalCategories}</p>
        </div>
        <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <p style={{ margin: 0, color: '#166534', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', color: '#16a34a', fontWeight: 600 }}>✓ Active</p>
        </div>
      </div>

      {/* Skills Grid by Category */}
      {skillList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sortedCats.map(cat => (
            <div key={cat} style={{
              background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a1a' }}>
                  {CAT_LABELS[cat] || cat}
                </span>
                <span style={{
                  background: '#e5e5e5', color: '#666', fontSize: '0.7rem',
                  padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: 600
                }}>
                  {categorized[cat].length}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {categorized[cat].map((s: string, i: number) => (
                  <span key={i} style={{
                    padding: '0.4rem 0.75rem', background: '#fff', borderRadius: '6px',
                    border: '1px solid #e5e5e5', fontSize: '0.8rem', color: '#333'
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '3rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>No skills found</p>
        </div>
      )}
    </main>
  );
}
