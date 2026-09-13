// app/api/dashboard/route.ts
import { getDashboardData } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getDashboardData();
  return NextResponse.json(data);
}
