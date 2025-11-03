// src/app/api/cron/compute-trends/route.ts
import { NextRequest, NextResponse } from "next/server";
import { computeTrends } from "@/lib/jobs/compute-trends";

/**
 * POST /api/cron/compute-trends
 * Vercel Cron job to compute daily trends
 * Runs at 2:00 AM daily
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/compute-trends",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Starting trend computation...");
    await computeTrends();
    console.log("Trend computation completed successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Trends computed successfully",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error computing trends:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to compute trends",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "GET method only allowed in development" },
      { status: 403 }
    );
  }

  return POST(request);
}
