import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Return default boards - no DB available
  return NextResponse.json({
    boards: [
      { slug: "default", name: "Default" },
      { slug: "fonselp", name: "Fonselp" },
      { slug: "octopush", name: "Octopush" },
      { slug: "bidlab-workertech", name: "Bidlab Workertech" },
    ]
  });
}
