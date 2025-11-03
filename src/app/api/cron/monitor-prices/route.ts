// src/app/api/cron/monitor-prices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { monitorPrices } from "@/lib/jobs/price-monitor";
import { bundleAndDispatchAlerts } from "@/lib/jobs/alert-dispatcher";

/**
 * POST /api/cron/monitor-prices
 * Vercel Cron job to monitor prices hourly
 * Runs every hour
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/monitor-prices",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting price monitoring...");

    // Monitor all prices and get alerts
    const alerts = await monitorPrices();

    console.log(`Found ${alerts.length} alerts to process`);

    // Bundle and dispatch alerts
    if (alerts.length > 0) {
      await bundleAndDispatchAlerts(alerts);
    }

    console.log("Price monitoring completed successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Price monitoring completed",
        alertsGenerated: alerts.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error monitoring prices:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to monitor prices",
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
