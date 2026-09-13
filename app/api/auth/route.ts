// app/api/auth/route.ts — kept for logout
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('mc_session');
  return response;
}
