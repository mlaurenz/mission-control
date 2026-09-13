// app/api/code/route.ts
import { getCodeData } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getCodeData();
  return NextResponse.json(data);
}
