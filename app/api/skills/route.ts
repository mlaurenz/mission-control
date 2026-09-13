// app/api/skills/route.ts
import { getSkills } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const skills = await getSkills();
  return NextResponse.json({ skills });
}
