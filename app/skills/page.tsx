// app/skills/page.tsx - Skills Page (Clean Style)
import { getSkills } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  let skills = { skills: [] };

  try { skills = await getSkills(); } catch (e) {}

  const skillList = skills.skills || [];

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
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categories</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>7</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', color: '#16a34a', fontWeight: 600 }}>✓ Active</p>
        </div>
      </div>

      {/* Skills Grid */}
      {skillList.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {skillList.map((skill: any, i: number) => (
            <div key={i} style={{ 
              background: '#fafafa', 
              borderRadius: '8px', 
              border: '1px solid #e5e5e5',
              padding: '1rem'
            }}>
              <div style={{ color: '#1a1a1a', fontSize: '0.9rem', fontWeight: 500 }}>{skill.name || skill}</div>
              {skill.category && <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>{skill.category}</div>}
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
