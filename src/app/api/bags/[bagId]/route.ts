// src/app/api/bags/[bagId]/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBagByChildId } from "@/lib/db/bags";
import { db } from "@/lib/db/client";

/**
 * GET /api/bags/[bagId] - Get bag with all items for authenticated parent
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bagId: string }> }
) {
  try {
    const { userId } = await auth();
    const { bagId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify the bag exists and belongs to the user's child
    const bag = await db.bag.findUnique({
      where: { id: bagId },
      include: {
        child: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!bag) {
      return NextResponse.json({ error: "Bag not found" }, { status: 404 });
    }

    // Check if the user owns this child
    if (bag.child.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the full bag with items
    const fullBag = await getBagByChildId(bag.childId);

    return NextResponse.json({ bag: fullBag });
  } catch (error) {
    console.error("Error fetching bag:", error);
    return NextResponse.json(
      { error: "Failed to fetch bag" },
      { status: 500 }
    );
  }
}
