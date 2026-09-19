'use client';
export const dynamic = 'force-dynamic';
// app/automations/page.tsx - Cron jobs grouped by client

import Link from 'next/link';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { timeAgo } from '../../lib/utils/time';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  profile: string;
  last_run: string;
  last_status: string;
  next_run: string;
}

interface ClientWithCron {
  slug: string;
  name: string;
  cron_jobs: CronJob[];
}

interface AutomationsData {
  cron: {
    cron_jobs: { id: string; name: string; schedule: string; next_run: string; last_run: string; status: string }[];
  };
  health: any;
}

export default function AutomationsPage() {
  // Fetch both schedule (all cron) and clients (for grouping)
  const { data: schedData, loading: loadingS } = useAutoRefresh<AutomationsData>({
    url: '/api/schedule',
    interval: 15000,
  });

  const { data: clientsData, loading: loadingC, lastUpdated, refetch } = useAutoRefresh<{ clients: any[] }>({
    url: '/api/clients',
    interval: 15000,
  });

  const loading = loadingS || loadingC;
  const allJobs = schedData?.cron?.cron_jobs || [];
  const clients = clientsData?.clients || [];

  // Group jobs by client slug (match job name against client slugs)
  const clientJobs: { client: string; clientName: string; jobs: typeof allJobs }[] = [];
  const unmatchedJobs: typeof allJobs = [];

  const jobMatched = new Set<number>();

  clients.forEach(client => {
    const slug = client.slug;
    const matching = allJobs.filter((job: any, idx: number) => {
      const name = (job.name || '').toLowerCase();
      if (name.includes(slug)) {
        jobMatched.add(idx);
        return true;
      }
      return false;
    });
    if (matching.length > 0) {
      clientJobs.push({ client: slug, clientName: client.name, jobs: matching });
    }
  });

  allJobs.forEach((job: any, idx: number) => {
    if (!jobMatched.has(idx)) {
      unmatchedJobs.push(job);
    }
  });

  const totalActive = allJobs.filter((j: any) => j.status === 'active' || j.status?.includes('active')).length;

  if (loading && !schedData && !clientsData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Automations"
        subtitle={`${allJobs.length} scheduled jobs · ${totalActive} active`}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-[0.65rem] text-gray-500 uppercase">Total Jobs</p>
          <p className="text-lg font-semibold text-gray-900">{allJobs.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <p className="text-[0.65rem] text-green-700 uppercase">Active</p>
          <p className="text-lg font-semibold text-green-800">{totalActive}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-[0.65rem] text-gray-500 uppercase">Client Automations</p>
          <p className="text-lg font-semibold text-gray-900">{clientJobs.length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-[0.65rem] text-gray-500 uppercase">System Jobs</p>
          <p className="text-lg font-semibold text-gray-900">{unmatchedJobs.length}</p>
        </div>
      </div>

      {/* Client-grouped jobs */}
      {clientJobs.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs text-gray-500 uppercase font-semibold mb-3 tracking-wider">By Client</h2>
          <div className="space-y-3">
            {clientJobs.map(({ client, clientName, jobs }) => (
              <Card key={client} title={clientName} titleRight={
                <Link href={`/clients/${client}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  View client →
                </Link>
              }>
                <div className="space-y-1.5">
                  {jobs.map((job: any, i: number) => (
                    <div key={job.id || i} className="flex items-center justify-between p-2.5 rounded-md border border-gray-200 bg-white text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            job.status === 'active' || job.status?.includes('active') ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className="font-medium text-gray-900">{job.name || 'Unnamed'}</span>
                        </div>
                        <span className="text-[0.65rem] text-gray-400 font-mono ml-4">{job.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {job.next_run && (
                          <span className="text-[0.65rem] text-gray-400">next: {job.next_run.substring(0, 16)}</span>
                        )}
                        {job.last_run && (
                          <span className="text-[0.65rem] text-gray-400">last: {timeAgo(job.last_run)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* System / unmatched jobs */}
      {unmatchedJobs.length > 0 && (
        <section>
          <h2 className="text-xs text-gray-500 uppercase font-semibold mb-3 tracking-wider">System Jobs</h2>
          <Card>
            <div className="space-y-1.5">
              {unmatchedJobs.map((job: any, i: number) => (
                <div key={job.id || i} className="flex items-center justify-between p-2.5 rounded-md border border-gray-200 bg-white text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        job.status === 'active' || job.status?.includes('active') ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium text-gray-900">{job.name || 'Unnamed'}</span>
                    </div>
                    <span className="text-[0.65rem] text-gray-400 font-mono ml-4">{job.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {job.next_run && (
                      <span className="text-[0.65rem] text-gray-400">next: {job.next_run.substring(0, 16)}</span>
                    )}
                    {job.last_run && (
                      <span className="text-[0.65rem] text-gray-400">last: {timeAgo(job.last_run)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {allJobs.length === 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm mb-1">No scheduled jobs</p>
          <p className="text-gray-400 text-xs">Cron jobs configured in Hermes will appear here.</p>
        </div>
      )}
    </div>
  );
}
