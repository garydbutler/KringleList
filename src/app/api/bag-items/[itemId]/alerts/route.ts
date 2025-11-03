// src/app/api/bag-items/[itemId]/alerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { enableAlerts, disableAlerts, getBagItemById } from "@/lib/db/bag-items";
import { prisma } from "@/lib/db/client";

/**
 * POST /api/bag-items/[itemId]/alerts
 * Enable or disable price alerts for a bag item
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = params;
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled field is required and must be boolean" },
        { status: 400 }
      );
    }

    // Verify the item belongs to the user
    const item = await getBagItemById(itemId);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check ownership through bag -> child -> user
    const bag = await prisma.bag.findUnique({
      where: { id: item.bagId },
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

    // Get user from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user || bag.child.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Enable or disable alerts
    if (enabled) {
      await enableAlerts(itemId);
    } else {
      await disableAlerts(itemId);
    }

    return NextResponse.json(
      {
        success: true,
        itemId,
        alertEnabled: enabled,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling alerts:", error);
    return NextResponse.json(
      { error: "Failed to toggle alerts" },
      { status: 500 }
    );
  }
}
