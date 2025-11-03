// src/lib/db/popularity-signals.ts
import { db } from "./client";
import { SignalType } from "@prisma/client";

/**
 * Update a popularity signal for a product
 * Creates a new signal record each time
 */
export async function updateSignal(
  productId: string,
  signalType: SignalType
): Promise<void> {
  await db.popularitySignal.create({
    data: {
      productId,
      signalType,
      signalValue: 1,
      recordedAt: new Date(),
    },
  });
}

/**
 * Get all signals for a product within a time window
 */
export async function getSignalsByProduct(
  productId: string,
  startDate: Date,
  endDate: Date
) {
  return db.popularitySignal.findMany({
    where: {
      productId,
      recordedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      recordedAt: "desc",
    },
  });
}

/**
 * Aggregate signals for trending calculation
 * Returns products with their signal counts for the specified time window
 */
export async function aggregateSignals(
  ageBand: string,
  startDate: Date,
  endDate: Date
) {
  // Get all products for this age band with their signals
  const products = await db.product.findMany({
    where: {
      ageBand,
    },
    include: {
      signals: {
        where: {
          recordedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      offers: {
        where: {
          isActive: true,
        },
        orderBy: {
          priceCents: "asc",
        },
        take: 1,
        include: {
          merchant: true,
        },
      },
    },
  });

  // Calculate weighted scores for each product
  const scoredProducts = products.map((product) => {
    const signalCounts = {
      VIEW: 0,
      ADD_TO_BAG: 0,
      CLAIM: 0,
      SHARE: 0,
      CLICK: 0,
    };

    product.signals.forEach((signal) => {
      signalCounts[signal.signalType] += signal.signalValue;
    });

    // Weighted scoring (per spec FR-038):
    // Views: 1 point, Add to Bag: 3 points, Claim: 5 points, Share: 2 points, Click: 1 point
    const score =
      signalCounts.VIEW * 1 +
      signalCounts.ADD_TO_BAG * 3 +
      signalCounts.CLAIM * 5 +
      signalCounts.SHARE * 2 +
      signalCounts.CLICK * 1;

    return {
      productId: product.id,
      product,
      score,
      signalCounts,
    };
  });

  // Sort by score descending and return top results
  return scoredProducts.sort((a, b) => b.score - a.score);
}
