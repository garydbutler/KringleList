import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getChildById,
  updateChild,
  deleteChild,
} from "@/lib/db/children";
import { getUserByClerkId } from "@/lib/db/users";
import { AgeBand } from "@prisma/client";

/**
 * GET /api/children/[id]
 * Get a specific child by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const child = await getChildById(id, user.id);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json({ child });
  } catch (error) {
    console.error("Error fetching child:", error);
    return NextResponse.json(
      { error: "Failed to fetch child" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/children/[id]
 * Update a child profile
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nickname, ageBand, interests, values, budgetCents } = body;

    // Validate ageBand if provided
    if (ageBand && !Object.values(AgeBand).includes(ageBand)) {
      return NextResponse.json(
        { error: "Invalid age band" },
        { status: 400 }
      );
    }

    // Validate interests if provided
    if (interests && (!Array.isArray(interests) || interests.length === 0)) {
      return NextResponse.json(
        { error: "Interests must be a non-empty array" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (ageBand !== undefined) updateData.ageBand = ageBand;
    if (interests !== undefined) updateData.interests = interests;
    if (values !== undefined) updateData.values = values;
    if (budgetCents !== undefined) updateData.budgetCents = budgetCents ? parseInt(budgetCents) : null;

    const child = await updateChild(id, user.id, updateData);

    return NextResponse.json({ child });
  } catch (error) {
    console.error("Error updating child:", error);
    return NextResponse.json(
      { error: "Failed to update child" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/children/[id]
 * Soft delete a child profile
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const child = await deleteChild(id, user.id);

    return NextResponse.json({ child });
  } catch (error) {
    console.error("Error deleting child:", error);
    return NextResponse.json(
      { error: "Failed to delete child" },
      { status: 500 }
    );
  }
}
