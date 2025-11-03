import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getChildren, createChild } from "@/lib/db/children";
import { getOrCreateUser } from "@/lib/db/users";
import { AgeBand } from "@prisma/client";

/**
 * GET /api/children
 * Get all children for the authenticated user
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user from Clerk to ensure we have their email
    const clerkUser = await currentUser();

    if (!clerkUser || !clerkUser.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create user in database
    const user = await getOrCreateUser(
      clerkId,
      clerkUser.emailAddresses[0].emailAddress
    );

    const children = await getChildren(user.id);

    return NextResponse.json({ children });
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/children
 * Create a new child profile
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user from Clerk to ensure we have their email
    const clerkUser = await currentUser();

    if (!clerkUser || !clerkUser.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create user in database
    const user = await getOrCreateUser(
      clerkId,
      clerkUser.emailAddresses[0].emailAddress
    );

    const body = await request.json();
    const { nickname, ageBand, interests, values, budgetCents } = body;

    // Validate required fields
    if (!nickname || !ageBand || !interests) {
      return NextResponse.json(
        { error: "Missing required fields: nickname, ageBand, interests" },
        { status: 400 }
      );
    }

    // Validate ageBand
    if (!Object.values(AgeBand).includes(ageBand)) {
      return NextResponse.json(
        { error: "Invalid age band" },
        { status: 400 }
      );
    }

    // Validate interests is an array
    if (!Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: "Interests must be a non-empty array" },
        { status: 400 }
      );
    }

    const child = await createChild({
      userId: user.id,
      nickname,
      ageBand,
      interests,
      values: values || [],
      budgetCents: budgetCents ? parseInt(budgetCents) : undefined,
    });

    return NextResponse.json({ child }, { status: 201 });
  } catch (error) {
    console.error("Error creating child:", error);
    return NextResponse.json(
      { error: "Failed to create child" },
      { status: 500 }
    );
  }
}
