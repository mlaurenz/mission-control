// lib/utils/skills.ts - Shared skill category mapping

export const SKILL_CAT_MAP: Record<string, string> = {
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

export const CAT_LABELS: Record<string, string> = {
  'social-media': '📱 Social Media',
  'media': '🎬 Media',
  'creative': '🎨 Creative',
  'note-taking': '📓 Note-taking',
  'research': '🔬 Research',
  'productivity': '🧩 Productivity',
  'devops': '⚙️ DevOps',
  'email': '📧 Email',
  'web': '🌐 Web',
  'software-development': '💻 Development',
  'autonomous-ai-agents': '🤖 AI Agents',
  'other': '📦 Other',
};

export function categorizeSkills(skills: string[]) {
  const categorized: Record<string, string[]> = {};
  skills.forEach((s: string) => {
    const cat = SKILL_CAT_MAP[s.toLowerCase()] || 'other';
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(s);
  });
  return categorized;
}
