// app/api/system/route.ts
import { getSystemData } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getSystemData();
  return NextResponse.json(data);
}
