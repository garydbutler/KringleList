// src/app/api/bag-items/[itemId]/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  deleteBagItem,
  getBagItemById,
  updateBagItem,
} from "@/lib/db/bag-items";
import { z } from "zod";

const updateItemSchema = z.object({
  quantity: z.number().int().min(1).max(99).optional(),
  isSurprise: z.boolean().optional(),
  alertEnabled: z.boolean().optional(),
});

/**
 * PATCH /api/bag-items/[itemId] - Update bag item (quantity, isSurprise, alertEnabled)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { userId } = await auth();
    const { itemId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateItemSchema.parse(body);

    // Verify item belongs to user's child's bag
    const bagItem = await getBagItemById(itemId);

    if (!bagItem) {
      return NextResponse.json(
        { error: "Bag item not found" },
        { status: 404 }
      );
    }

    if (bagItem.bag.child.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the item
    const updatedItem = await updateBagItem(itemId, validatedData);

    return NextResponse.json({ bagItem: updatedItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating bag item:", error);
    return NextResponse.json(
      { error: "Failed to update bag item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bag-items/[itemId] - Remove item from bag
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { userId } = await auth();
    const { itemId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify item belongs to user's child's bag
    const bagItem = await getBagItemById(itemId);

    if (!bagItem) {
      return NextResponse.json(
        { error: "Bag item not found" },
        { status: 404 }
      );
    }

    if (bagItem.bag.child.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the item
    await deleteBagItem(itemId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bag item:", error);
    return NextResponse.json(
      { error: "Failed to delete bag item" },
      { status: 500 }
    );
  }
}
