// src/app/api/bags/[bagId]/items/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { addBagItem } from "@/lib/db/bag-items";
import { createBag, getBagByChildId } from "@/lib/db/bags";
import { prisma as db } from "@/lib/db/client";
import { z } from "zod";

const addItemSchema = z.object({
  productOfferId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99).optional().default(1),
  isSurprise: z.boolean().optional().default(false),
  childId: z.string().uuid(), // Required to create bag if it doesn't exist
});

/**
 * POST /api/bags/[bagId]/items - Add item to bag
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bagId: string }> }
) {
  try {
    const { userId } = await auth();
    const { bagId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = addItemSchema.parse(body);

    // Handle special case: bagId is "new" - create bag first
    let actualBagId = bagId;
    if (bagId === "new") {
      // Verify child belongs to user
      const child = await db.child.findUnique({
        where: { id: validatedData.childId },
        select: { userId: true, id: true },
      });

      if (!child || child.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Check if bag already exists for this child
      const existingBag = await getBagByChildId(validatedData.childId);
      if (existingBag) {
        actualBagId = existingBag.id;
      } else {
        const newBag = await createBag(validatedData.childId);
        actualBagId = newBag.id;
      }
    } else {
      // Verify bag exists and belongs to user's child
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

      if (bag.child.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Add item to bag
    const bagItem = await addBagItem({
      bagId: actualBagId,
      productOfferId: validatedData.productOfferId,
      quantity: validatedData.quantity,
      isSurprise: validatedData.isSurprise,
    });

    return NextResponse.json({ bagItem }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error adding item to bag:", error);
    return NextResponse.json(
      { error: "Failed to add item to bag" },
      { status: 500 }
    );
  }
}
