// src/app/api/alerts/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/client";
import { getOrCreateUser } from "@/lib/db/users";
import { currentUser } from "@clerk/nextjs/server";

/**
 * GET /api/alerts/history
 * Get alert history for the past 30 days for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user email
    const clerkUser = await currentUser();

    if (!clerkUser || !clerkUser.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userEmail = clerkUser.emailAddresses[0].emailAddress;

    // Get alert history for past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await prisma.alertHistory.findMany({
      where: {
        userEmail,
        sentAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        bagItem: {
          include: {
            productOffer: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    primaryImageUrl: true,
                  },
                },
                merchant: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            bag: {
              include: {
                child: {
                  select: {
                    nickname: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching alert history:", error);
    return NextResponse.json(
      { error: "Failed to fetch alert history" },
      { status: 500 }
    );
  }
}
