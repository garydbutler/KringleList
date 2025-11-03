// src/lib/jobs/compute-trends.ts
import { db } from "../db/client";
import { aggregateSignals } from "../db/popularity-signals";
import { AGE_BANDS } from "../utils/constants";

export type TrendBadge = "Rising" | "Back in Stock" | "High Margin" | "Best Value";

export interface TrendingProduct {
  productId: string;
  product: any;
  score: number;
  badges: TrendBadge[];
  rank: number;
}

/**
 * Assign trend badges to products based on criteria (FR-039)
 */
export function assignTrendBadges(
  currentScore: number,
  previousScore: number,
  product: any
): TrendBadge[] {
  const badges: TrendBadge[] = [];

  // Rising: ≥50% increase in score vs previous period
  if (previousScore > 0 && currentScore >= previousScore * 1.5) {
    badges.push("Rising");
  }

  // Back in Stock: Product was out of stock but now has active offers
  const hasActiveOffers = product.offers && product.offers.length > 0;
  if (hasActiveOffers && product._wasOutOfStock) {
    badges.push("Back in Stock");
  }

  // High Margin: Affiliate commission ≥12%
  if (product.offers && product.offers.length > 0) {
    const bestOffer = product.offers[0];
    if (bestOffer.commissionRateBps >= 1200) {
      // 12% = 1200 bps
      badges.push("High Margin");
    }
  }

  // Best Value: Lowest price among similar products (simplified)
  // In a full implementation, this would compare against similar products
  // For now, we'll mark products with commission + low price
  if (product.offers && product.offers.length > 0) {
    const bestOffer = product.offers[0];
    if (
      bestOffer.priceCents < 3000 && // Under $30
      bestOffer.commissionRateBps >= 800 // At least 8% commission
    ) {
      badges.push("Best Value");
    }
  }

  return badges;
}

/**
 * Compute trending products for all age bands
 * Runs daily at 2:00 AM (called by cron job)
 */
export async function computeTrends(): Promise<void> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Process each age band
  for (const ageBand of Object.keys(AGE_BANDS)) {
    // Get current period scores
    const currentResults = await aggregateSignals(ageBand, oneDayAgo, now);

    // Get previous period scores for comparison
    const previousResults = await aggregateSignals(ageBand, twoDaysAgo, oneDayAgo);
    const previousScores = new Map(
      previousResults.map((r) => [r.productId, r.score])
    );

    // Take top 10 and assign badges
    const topProducts = currentResults.slice(0, 10).map((result, index) => {
      const previousScore = previousScores.get(result.productId) || 0;
      const badges = assignTrendBadges(
        result.score,
        previousScore,
        result.product
      );

      return {
        productId: result.productId,
        ageBand,
        score: result.score,
        badges,
        rank: index + 1,
        computedAt: now,
      };
    });

    // Store in TrendSnapshot table
    if (topProducts.length > 0) {
      await db.trendSnapshot.createMany({
        data: topProducts.map((p) => ({
          productId: p.productId,
          ageBand: p.ageBand,
          rank: p.rank,
          trendScore: p.score,
          badges: p.badges,
          snapshotDate: now,
        })),
      });
    }
  }

  console.log(`Trends computed at ${now.toISOString()}`);
}

/**
 * Get latest trends for an age band
 */
export async function getLatestTrends(ageBand: string): Promise<TrendingProduct[]> {
  // Get the most recent snapshot date
  const latestSnapshot = await db.trendSnapshot.findFirst({
    where: { ageBand },
    orderBy: { snapshotDate: "desc" },
    select: { snapshotDate: true },
  });

  if (!latestSnapshot) {
    return [];
  }

  // Get all products from that snapshot
  const trends = await db.trendSnapshot.findMany({
    where: {
      ageBand,
      snapshotDate: latestSnapshot.snapshotDate,
    },
    include: {
      product: {
        include: {
          offers: {
            where: { isActive: true },
            orderBy: { priceCents: "asc" },
            take: 1,
            include: {
              merchant: true,
            },
          },
        },
      },
    },
    orderBy: { rank: "asc" },
  });

  return trends.map((trend) => ({
    productId: trend.productId,
    product: trend.product,
    score: trend.trendScore,
    badges: trend.badges as TrendBadge[],
    rank: trend.rank,
  }));
}
