'use client';
export const dynamic = 'force-dynamic';
// app/skills/page.tsx - Skills with auto-refresh
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { categorizeSkills, CAT_LABELS } from '../../lib/utils/skills';

interface SkillsData {
  skills: any;
}

export default function SkillsPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<SkillsData>({
    url: '/api/skills',
    interval: 30000,
  });

  const skillList = data?.skills?.skills || [];
  const categorized = categorizeSkills(skillList);
  const sortedCats = Object.keys(categorized).sort();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Skills"
        subtitle={`${skillList.length} skills installed across ${sortedCats.length} categories`}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Skills</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{skillList.length}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Categories</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{sortedCats.length}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {skillList.length > 0 ? (
        <div className="space-y-2">
          {sortedCats.map(cat => (
            <div key={cat} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-900">{CAT_LABELS[cat] || cat}</span>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  {categorized[cat].length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categorized[cat].map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-white rounded-md border border-gray-200 text-sm text-gray-700 transition-colors hover:bg-gray-100">
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
