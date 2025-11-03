// src/app/api/bags/[bagId]/share/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { regenerateShareToken } from "@/lib/db/bags";
import { db } from "@/lib/db/client";

/**
 * POST /api/bags/[bagId]/share - Generate/regenerate share link
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

    // Verify bag belongs to user's child
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

    // Regenerate share token
    const updatedBag = await regenerateShareToken(bagId);

    // Construct the full share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/shared/bag/${updatedBag.shareToken}`;

    return NextResponse.json({
      shareToken: updatedBag.shareToken,
      shareUrl,
    });
  } catch (error) {
    console.error("Error generating share link:", error);
    return NextResponse.json(
      { error: "Failed to generate share link" },
      { status: 500 }
    );
  }
}
