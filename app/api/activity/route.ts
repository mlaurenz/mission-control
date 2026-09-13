// app/api/activity/route.ts
import { getActivityData } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getActivityData();
  return NextResponse.json(data);
}
