// app/api/schedule/route.ts
import { getCron, getHealth } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [cron, health] = await Promise.all([getCron(), getHealth()]);
  return NextResponse.json({ cron, health });
}
