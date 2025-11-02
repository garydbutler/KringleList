import { prisma } from "./client";
import { ProductOffer } from "@prisma/client";

/**
 * Get all offers for a product
 */
export async function getOffersByProductId(
  productId: string
): Promise<ProductOffer[]> {
  return prisma.productOffer.findMany({
    where: {
      productId,
    },
    orderBy: {
      priceCents: "asc",
    },
    include: {
      merchant: true,
    },
  });
}

/**
 * Get the best (lowest price, in stock) offer for a product
 */
export async function getBestOfferForProduct(
  productId: string
): Promise<ProductOffer | null> {
  return prisma.productOffer.findFirst({
    where: {
      productId,
      inStock: true,
    },
    orderBy: {
      priceCents: "asc",
    },
    include: {
      merchant: true,
    },
  });
}

/**
 * Get offers for multiple products (batch)
 */
export async function getBestOffersForProducts(
  productIds: string[]
): Promise<Map<string, ProductOffer>> {
  const offers = await prisma.productOffer.findMany({
    where: {
      productId: {
        in: productIds,
      },
      inStock: true,
    },
    orderBy: {
      priceCents: "asc",
    },
    include: {
      merchant: true,
    },
  });

  // Group by productId and keep only the best (first) offer for each product
  const bestOffers = new Map<string, ProductOffer>();

  for (const offer of offers) {
    if (!bestOffers.has(offer.productId)) {
      bestOffers.set(offer.productId, offer);
    }
  }

  return bestOffers;
}

/**
 * Get offer by ID
 */
export async function getOfferById(id: string): Promise<ProductOffer | null> {
  return prisma.productOffer.findUnique({
    where: { id },
    include: {
      merchant: true,
      product: true,
    },
  });
}

/**
 * Get in-stock offers count for a product
 */
export async function getInStockOfferCount(productId: string): Promise<number> {
  return prisma.productOffer.count({
    where: {
      productId,
      inStock: true,
    },
  });
}
