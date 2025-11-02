import { prisma } from "./client";
import { Product, ProductOffer, AgeBand } from "@prisma/client";

export type ProductWithBestOffer = Product & {
  bestOffer?: ProductOffer | null;
  allOffers?: ProductOffer[];
};

export type SearchProductsParams = {
  ageBand?: AgeBand;
  interests?: string[];
  values?: string[];
  minPrice?: number;
  maxPrice?: number;
  merchantIds?: string[];
  limit?: number;
  offset?: number;
};

/**
 * Get products with pagination
 */
export async function getProducts(
  limit: number = 20,
  offset: number = 0
): Promise<Product[]> {
  return prisma.product.findMany({
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { id },
  });
}

/**
 * Search products with filters
 * NOTE: This is a simplified implementation. In production, this would use Meilisearch.
 * For now, we'll use database queries with basic filtering.
 */
export async function searchProducts(
  params: SearchProductsParams
): Promise<ProductWithBestOffer[]> {
  const {
    ageBand,
    interests = [],
    values = [],
    minPrice,
    maxPrice,
    merchantIds,
    limit = 20,
    offset = 0,
  } = params;

  // Build where clause
  const where: any = {};

  // Filter by age band
  if (ageBand) {
    where.ageBands = {
      has: ageBand,
    };
  }

  // Filter by interests (at least one match)
  if (interests.length > 0) {
    where.interests = {
      hasSome: interests,
    };
  }

  // Filter by values (at least one match)
  if (values.length > 0) {
    where.values = {
      hasSome: values,
    };
  }

  // Get products with their offers
  const products = await prisma.product.findMany({
    where,
    take: limit,
    skip: offset,
    include: {
      productOffers: {
        where: {
          inStock: true,
          ...(minPrice || maxPrice
            ? {
                priceCents: {
                  ...(minPrice ? { gte: minPrice } : {}),
                  ...(maxPrice ? { lte: maxPrice } : {}),
                },
              }
            : {}),
          ...(merchantIds
            ? {
                merchantId: {
                  in: merchantIds,
                },
              }
            : {}),
        },
        orderBy: {
          priceCents: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Filter out products with no valid offers and attach best offer
  const productsWithOffers: ProductWithBestOffer[] = products
    .filter((p) => p.productOffers.length > 0)
    .map((p) => ({
      ...p,
      bestOffer: p.productOffers[0] || null,
      allOffers: p.productOffers,
    }));

  return productsWithOffers;
}

/**
 * Get products by IDs
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return prisma.product.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
}

/**
 * Get product count for search
 */
export async function getProductCount(
  params: SearchProductsParams
): Promise<number> {
  const { ageBand, interests = [], values = [] } = params;

  const where: any = {};

  if (ageBand) {
    where.ageBands = {
      has: ageBand,
    };
  }

  if (interests.length > 0) {
    where.interests = {
      hasSome: interests,
    };
  }

  if (values.length > 0) {
    where.values = {
      hasSome: values,
    };
  }

  return prisma.product.count({ where });
}
