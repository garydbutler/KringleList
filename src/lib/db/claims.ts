// src/lib/db/claims.ts
import { db } from "./client";
import { ClaimStatus } from "@prisma/client";

export interface CreateClaimInput {
  bagItemId: string;
  claimerName: string;
  claimerEmail?: string;
}

/**
 * Create a claim for a bag item
 */
export async function createClaim(input: CreateClaimInput) {
  return db.claim.create({
    data: {
      bagItemId: input.bagItemId,
      claimerName: input.claimerName,
      claimerEmail: input.claimerEmail,
      status: ClaimStatus.CLAIMED,
    },
  });
}

/**
 * Get claim by bag item ID
 */
export async function getClaimByBagItemId(bagItemId: string) {
  return db.claim.findUnique({
    where: { bagItemId },
  });
}

/**
 * Delete a claim (unclaim)
 * Only allowed within 24 hours of claiming
 */
export async function deleteClaim(bagItemId: string) {
  const claim = await db.claim.findUnique({
    where: { bagItemId },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  // Check if claim is within 24 hours
  const hoursSinceClaim =
    (Date.now() - claim.claimedAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceClaim > 24) {
    throw new Error("Cannot unclaim after 24 hours");
  }

  return db.claim.delete({
    where: { bagItemId },
  });
}

/**
 * Mark a claim as purchased
 */
export async function markClaimAsPurchased(bagItemId: string) {
  return db.claim.update({
    where: { bagItemId },
    data: {
      status: ClaimStatus.PURCHASED,
      purchasedAt: new Date(),
    },
  });
}

/**
 * Get all claims for a bag
 */
export async function getClaimsByBagId(bagId: string) {
  return db.claim.findMany({
    where: {
      bagItem: {
        bagId,
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
            },
          },
        },
      },
    },
    orderBy: {
      claimedAt: "desc",
    },
  });
}
