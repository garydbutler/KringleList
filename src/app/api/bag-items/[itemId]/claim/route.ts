// src/app/api/bag-items/[itemId]/claim/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createClaim,
  deleteClaim,
  getClaimByBagItemId,
} from "@/lib/db/claims";
import { getBagItemById } from "@/lib/db/bag-items";
import { z } from "zod";

const createClaimSchema = z.object({
  claimerName: z.string().min(1).max(100),
  claimerEmail: z.string().email().optional(),
});

/**
 * POST /api/bag-items/[itemId]/claim - Claim a bag item (public, no auth required)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await req.json();
    const validatedData = createClaimSchema.parse(body);

    // Verify bag item exists and is not already claimed
    const bagItem = await getBagItemById(itemId);

    if (!bagItem) {
      return NextResponse.json(
        { error: "Bag item not found" },
        { status: 404 }
      );
    }

    // Check if already claimed
    const existingClaim = await getClaimByBagItemId(itemId);
    if (existingClaim) {
      return NextResponse.json(
        { error: "Item already claimed" },
        { status: 409 }
      );
    }

    // Create the claim
    const claim = await createClaim({
      bagItemId: itemId,
      claimerName: validatedData.claimerName,
      claimerEmail: validatedData.claimerEmail,
    });

    return NextResponse.json({ claim }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating claim:", error);
    return NextResponse.json(
      { error: "Failed to create claim" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bag-items/[itemId]/claim - Unclaim a bag item (within 24 hours)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    await deleteClaim(itemId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Claim not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Cannot unclaim after 24 hours") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    console.error("Error deleting claim:", error);
    return NextResponse.json(
      { error: "Failed to delete claim" },
      { status: 500 }
    );
  }
}
