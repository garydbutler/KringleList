// src/lib/jobs/price-monitor.ts
import { db } from "../db/client";
import { getItemsWithAlertsEnabled } from "../db/bag-items";
import { createSnapshot, hasDroppedSince, cameBackInStock } from "../db/price-history";

export interface PriceAlert {
  bagItemId: string;
  productOfferId: string;
  userId: string;
  userEmail: string;
  childNickname: string;
  productTitle: string;
  alertType: "PRICE_DROP" | "RESTOCK";
  oldPriceCents?: number;
  newPriceCents: number;
  dropPercentage?: number;
  merchantName: string;
}

/**
 * Monitor prices for all bag items with alerts enabled
 * Checks current prices against historical data and triggers alerts
 */
export async function monitorPrices(): Promise<PriceAlert[]> {
  const alerts: PriceAlert[] = [];

  // Get all bag items with alerts enabled
  const bagItems = await getItemsWithAlertsEnabled();

  console.log(`Monitoring ${bagItems.length} items with alerts enabled`);

  for (const item of bagItems) {
    try {
      // Fetch current offer data
      const currentOffer = await db.productOffer.findUnique({
        where: { id: item.productOfferId },
        include: {
          product: true,
          merchant: true,
        },
      });

      if (!currentOffer) {
        console.warn(`Offer ${item.productOfferId} not found, skipping`);
        continue;
      }

      // Get the bag and user info
      const bag = await db.bag.findUnique({
        where: { id: item.bagId },
        include: {
          child: {
            select: {
              nickname: true,
              userId: true,
            },
          },
        },
      });

      if (!bag) {
        console.warn(`Bag ${item.bagId} not found, skipping`);
        continue;
      }

      // Get user email
      const user = await db.user.findUnique({
        where: { id: bag.child.userId },
        select: { email: true },
      });

      if (!user) {
        console.warn(`User ${bag.child.userId} not found, skipping`);
        continue;
      }

      // Create price snapshot
      await createSnapshot(
        currentOffer.id,
        currentOffer.priceCents,
        currentOffer.isActive
      );

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Check for price drop
      const priceDropped = await hasDroppedSince(
        currentOffer.id,
        oneDayAgo,
        currentOffer.priceCents
      );

      if (priceDropped) {
        // Get previous price to calculate drop percentage
        const previousSnapshot = await db.priceHistory.findFirst({
          where: {
            productOfferId: currentOffer.id,
            recordedAt: {
              lte: oneDayAgo,
            },
          },
          orderBy: {
            recordedAt: "desc",
          },
        });

        const dropPercentage = previousSnapshot
          ? ((previousSnapshot.priceCents - currentOffer.priceCents) /
              previousSnapshot.priceCents) *
            100
          : 0;

        alerts.push({
          bagItemId: item.id,
          productOfferId: currentOffer.id,
          userId: bag.child.userId,
          userEmail: user.email,
          childNickname: bag.child.nickname,
          productTitle: currentOffer.product.title,
          alertType: "PRICE_DROP",
          oldPriceCents: previousSnapshot?.priceCents,
          newPriceCents: currentOffer.priceCents,
          dropPercentage: Math.round(dropPercentage),
          merchantName: currentOffer.merchant?.name || "Unknown",
        });
      }

      // Check for restock
      const restocked = await cameBackInStock(
        currentOffer.id,
        oneDayAgo,
        currentOffer.isActive
      );

      if (restocked) {
        alerts.push({
          bagItemId: item.id,
          productOfferId: currentOffer.id,
          userId: bag.child.userId,
          userEmail: user.email,
          childNickname: bag.child.nickname,
          productTitle: currentOffer.product.title,
          alertType: "RESTOCK",
          newPriceCents: currentOffer.priceCents,
          merchantName: currentOffer.merchant?.name || "Unknown",
        });
      }
    } catch (error) {
      console.error(`Error monitoring item ${item.id}:`, error);
    }
  }

  console.log(`Generated ${alerts.length} alerts`);
  return alerts;
}
