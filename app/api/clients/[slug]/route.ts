// app/api/clients/[slug]/route.ts
import { getClient } from '../../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getClient(slug);
  return NextResponse.json(data || { slug, name: slug, tasks: [], agents: [], cron_jobs: [] });
}
