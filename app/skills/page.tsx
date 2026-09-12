// app/skills/page.tsx - Skills Page
import { getSkills } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  let skills = { skills: [] };

  try { skills = await getSkills(); } catch (e) {}

  const skillList = skills.skills || [];

  return (
    <main style={{ color: '#e0e0e0' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>🔧 Skills</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.85rem' }}>
          Hermes skills installed
        </p>
      </header>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Skills</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{skillList.length}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Categories</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#fff' }}>7</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', color: '#4ade80' }}>✓ Active</p>
        </div>
      </div>

      {/* Skills Grid */}
      {skillList.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {skillList.map((skill: any, i: number) => (
            <div key={i} style={{ 
              background: '#141414', 
              borderRadius: '8px', 
              border: '1px solid #333',
              padding: '1rem'
            }}>
              <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>{skill.name || skill}</div>
              {skill.category && <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>{skill.category}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333', padding: '3rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>No skills found</p>
        </div>
      )}
    </main>
  );
}
