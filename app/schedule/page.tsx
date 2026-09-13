// app/schedule/page.tsx - Schedule Page with Tailwind
import { getCron, getHealth } from '../../lib/connectors/HermesConnector';
import PageHeader from '../components/PageHeader';
import OfflineBanner from '../components/OfflineBanner';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const cron = await getCron();
  const health = await getHealth();

  const cronJobs = cron?.cron_jobs || [];
  const isOffline = !cron;

  return (
    <div>
      <PageHeader
        title="Schedule"
        icon="⏰"
        subtitle={isOffline ? '⚠️ Bridge offline' : 'Cron jobs programados'}
        status={health?.status === 'healthy' ? 'online' : 'offline'}
      />

      {isOffline ? (
        <OfflineBanner message="Los cron jobs no están disponibles" />
      ) : cronJobs.length > 0 ? (
        <div className="space-y-3">
          {cronJobs.map((job: any, i: number) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">{job.name || 'Unnamed Job'}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold
                  ${job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}
                `}>
                  {job.status || 'unknown'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                <div><strong>Schedule:</strong> {job.schedule || 'N/A'}</div>
                <div><strong>Next run:</strong> {job.next_run || 'N/A'}</div>
                <div><strong>Last run:</strong> {job.last_run || 'N/A'}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-xl text-center">
          <div className="text-4xl mb-3">⏰</div>
          <p className="text-gray-400 mb-4">No hay cron jobs programados</p>
        </div>
      )}
    </div>
  );
}
