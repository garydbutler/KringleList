// src/app/api/shared/bags/[token]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBagByShareToken } from "@/lib/db/bags";

/**
 * GET /api/shared/bags/[token] - Get public bag view (excludes surprise items)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const bag = await getBagByShareToken(token);

    if (!bag) {
      return NextResponse.json({ error: "Bag not found" }, { status: 404 });
    }

    return NextResponse.json({ bag });
  } catch (error) {
    console.error("Error fetching shared bag:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared bag" },
      { status: 500 }
    );
  }
}
