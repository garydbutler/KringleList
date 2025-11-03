// src/lib/db/price-history.ts
import { db } from "./client";

/**
 * Create a price snapshot for tracking price history
 */
export async function createSnapshot(
  productOfferId: string,
  priceCents: number,
  isAvailable: boolean
): Promise<void> {
  await db.priceHistory.create({
    data: {
      productOfferId,
      priceCents,
      isAvailable,
      recordedAt: new Date(),
    },
  });
}

/**
 * Get price history for a product offer within a time window
 */
export async function getPriceHistory(
  productOfferId: string,
  startDate: Date,
  endDate: Date
) {
  return db.priceHistory.findMany({
    where: {
      productOfferId,
      recordedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      recordedAt: "asc",
    },
  });
}

/**
 * Get the minimum price for an offer within a time window
 */
export async function getMinPriceForWindow(
  productOfferId: string,
  startDate: Date,
  endDate: Date
): Promise<number | null> {
  const result = await db.priceHistory.aggregate({
    where: {
      productOfferId,
      recordedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _min: {
      priceCents: true,
    },
  });

  return result._min.priceCents;
}

/**
 * Get the latest price snapshot for an offer
 */
export async function getLatestSnapshot(productOfferId: string) {
  return db.priceHistory.findFirst({
    where: {
      productOfferId,
    },
    orderBy: {
      recordedAt: "desc",
    },
  });
}

/**
 * Check if price has dropped since the last check
 */
export async function hasDroppedSince(
  productOfferId: string,
  sinceDate: Date,
  currentPriceCents: number
): Promise<boolean> {
  const previousSnapshot = await db.priceHistory.findFirst({
    where: {
      productOfferId,
      recordedAt: {
        lte: sinceDate,
      },
    },
    orderBy: {
      recordedAt: "desc",
    },
  });

  if (!previousSnapshot) {
    return false;
  }

  return currentPriceCents < previousSnapshot.priceCents;
}

/**
 * Check if item came back in stock
 */
export async function cameBackInStock(
  productOfferId: string,
  sinceDate: Date,
  currentlyAvailable: boolean
): Promise<boolean> {
  if (!currentlyAvailable) {
    return false; // Not currently available
  }

  const previousSnapshot = await db.priceHistory.findFirst({
    where: {
      productOfferId,
      recordedAt: {
        lte: sinceDate,
      },
    },
    orderBy: {
      recordedAt: "desc",
    },
  });

  if (!previousSnapshot) {
    return false;
  }

  // Came back in stock if it was previously unavailable but is now available
  return !previousSnapshot.isAvailable && currentlyAvailable;
}
