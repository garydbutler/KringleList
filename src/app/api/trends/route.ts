// src/app/api/trends/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLatestTrends } from "@/lib/jobs/compute-trends";
import { AGE_BANDS } from "@/lib/utils/constants";

/**
 * GET /api/trends
 * Get trending products by age band
 * Query params: ageBand (optional, defaults to all)
 * Cached daily
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ageBand = searchParams.get("ageBand");

    // Validate age band if provided
    if (ageBand && !Object.keys(AGE_BANDS).includes(ageBand)) {
      return NextResponse.json(
        { error: "Invalid age band" },
        { status: 400 }
      );
    }

    // If specific age band requested, return only that
    if (ageBand) {
      const trends = await getLatestTrends(ageBand);
      return NextResponse.json(
        { ageBand, trends },
        {
          headers: {
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
          },
        }
      );
    }

    // Otherwise return trends for all age bands
    const allTrends: Record<string, any[]> = {};
    for (const band of Object.keys(AGE_BANDS)) {
      allTrends[band] = await getLatestTrends(band);
    }

    return NextResponse.json(
      { trends: allTrends },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}
