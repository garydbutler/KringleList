// src/lib/db/bags.ts
import { db } from "./client";
import { nanoid } from "nanoid";

export interface BagWithItems {
  id: string;
  childId: string;
  shareToken: string;
  totalBudgetCents: number | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productOfferId: string;
    quantity: number;
    isSurprise: boolean;
    backupOfferIds: string[];
    alertEnabled: boolean;
    createdAt: Date;
    claim: {
      id: string;
      claimerName: string;
      claimerEmail: string | null;
      status: string;
      claimedAt: Date;
    } | null;
    productOffer: {
      id: string;
      priceCents: number;
      productId: string;
      product: {
        id: string;
        title: string;
        primaryImageUrl: string | null;
      };
    };
  }>;
  child: {
    id: string;
    nickname: string;
    ageBand: string;
  };
}

/**
 * Get bag by child ID (for authenticated parent)
 */
export async function getBagByChildId(
  childId: string
): Promise<BagWithItems | null> {
  return db.bag.findUnique({
    where: { childId },
    include: {
      child: {
        select: {
          id: true,
          nickname: true,
          ageBand: true,
        },
      },
      items: {
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
            },
          },
          claim: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

/**
 * Get bag by share token (for public sharing)
 * Excludes items marked as "surprise"
 */
export async function getBagByShareToken(
  shareToken: string
): Promise<BagWithItems | null> {
  const bag = await db.bag.findUnique({
    where: { shareToken },
    include: {
      child: {
        select: {
          id: true,
          nickname: true,
          ageBand: true,
        },
      },
      items: {
        where: {
          isSurprise: false, // Exclude surprises from public view
        },
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
            },
          },
          claim: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return bag;
}

/**
 * Create a bag for a child (auto-created when first item is added)
 */
export async function createBag(childId: string) {
  return db.bag.create({
    data: {
      childId,
      shareToken: nanoid(16), // Generate short, URL-friendly token
    },
  });
}

/**
 * Regenerate share token (for security if link is compromised)
 */
export async function regenerateShareToken(bagId: string) {
  return db.bag.update({
    where: { id: bagId },
    data: {
      shareToken: nanoid(16),
    },
  });
}

/**
 * Calculate total spend for a bag (sum of all items * quantities, including claimed)
 */
export async function calculateTotalSpend(bagId: string): Promise<number> {
  const bag = await db.bag.findUnique({
    where: { id: bagId },
    include: {
      items: {
        include: {
          productOffer: {
            select: {
              priceCents: true,
            },
          },
        },
      },
    },
  });

  if (!bag) return 0;

  return bag.items.reduce((total, item) => {
    return total + item.productOffer.priceCents * item.quantity;
  }, 0);
}

/**
 * Calculate remaining budget for a bag
 */
export async function calculateRemainingBudget(
  bagId: string
): Promise<number | null> {
  const bag = await db.bag.findUnique({
    where: { id: bagId },
    select: {
      totalBudgetCents: true,
      child: {
        select: {
          budgetCents: true,
        },
      },
    },
  });

  if (!bag) return null;

  const budgetCents = bag.totalBudgetCents ?? bag.child.budgetCents;
  if (!budgetCents) return null;

  const totalSpend = await calculateTotalSpend(bagId);
  return budgetCents - totalSpend;
}

/**
 * Get budget status (green/yellow/red based on percentage used)
 * Green: < 75%, Yellow: 75-95%, Red: >= 95%
 */
export async function getBudgetStatus(
  bagId: string
): Promise<"green" | "yellow" | "red" | null> {
  const bag = await db.bag.findUnique({
    where: { id: bagId },
    select: {
      totalBudgetCents: true,
      child: {
        select: {
          budgetCents: true,
        },
      },
    },
  });

  if (!bag) return null;

  const budgetCents = bag.totalBudgetCents ?? bag.child.budgetCents;
  if (!budgetCents) return null;

  const totalSpend = await calculateTotalSpend(bagId);
  const percentUsed = (totalSpend / budgetCents) * 100;

  if (percentUsed >= 95) return "red";
  if (percentUsed >= 75) return "yellow";
  return "green";
}
