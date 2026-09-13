// app/skills/page.tsx - Skills Page with Tailwind
import { getSkills } from '../../lib/connectors/HermesConnector';
import PageHeader from '../components/PageHeader';
import { categorizeSkills, CAT_LABELS } from '../../lib/utils/skills';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  let skills = { skills: [] as string[] };
  try { skills = (await getSkills()) || skills; } catch {}

  const skillList = skills.skills || [];
  const categorized = categorizeSkills(skillList);
  const sortedCats = Object.keys(categorized).sort();

  return (
    <div>
      <PageHeader title="Skills" icon="🔧" subtitle="Hermes skills installed" />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Skills</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{skillList.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 uppercase tracking-wider">Categories</p>
          <p className="text-2xl font-semibold text-blue-800 mt-1">{sortedCats.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 uppercase tracking-wider">Status</p>
          <p className="text-xl font-semibold text-green-600 mt-1">✓ Active</p>
        </div>
      </div>

      {/* Skills Grid */}
      {skillList.length > 0 ? (
        <div className="space-y-2">
          {sortedCats.map(cat => (
            <div key={cat} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-900">{CAT_LABELS[cat] || cat}</span>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {categorized[cat].length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categorized[cat].map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-white rounded-md border border-gray-200 text-sm text-gray-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
          <p className="text-gray-400">No skills found</p>
        </div>
      )}
    </div>
  );
}
