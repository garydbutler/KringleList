// src/lib/db/bag-items.ts
import { db } from "./client";

export interface AddBagItemInput {
  bagId: string;
  productOfferId: string;
  quantity?: number;
  isSurprise?: boolean;
}

export interface UpdateBagItemInput {
  quantity?: number;
  isSurprise?: boolean;
  alertEnabled?: boolean;
}

/**
 * Add an item to a bag
 */
export async function addBagItem(input: AddBagItemInput) {
  return db.bagItem.create({
    data: {
      bagId: input.bagId,
      productOfferId: input.productOfferId,
      quantity: input.quantity ?? 1,
      isSurprise: input.isSurprise ?? false,
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
    },
  });
}

/**
 * Get all items in a bag
 */
export async function getBagItems(bagId: string) {
  return db.bagItem.findMany({
    where: { bagId },
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
  });
}

/**
 * Get a single bag item by ID
 */
export async function getBagItemById(itemId: string) {
  return db.bagItem.findUnique({
    where: { id: itemId },
    include: {
      productOffer: {
        include: {
          product: true,
          merchant: true,
        },
      },
      claim: true,
      bag: {
        include: {
          child: {
            select: {
              id: true,
              nickname: true,
              userId: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Update a bag item
 */
export async function updateBagItem(itemId: string, input: UpdateBagItemInput) {
  return db.bagItem.update({
    where: { id: itemId },
    data: input,
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
  });
}

/**
 * Delete a bag item
 */
export async function deleteBagItem(itemId: string) {
  return db.bagItem.delete({
    where: { id: itemId },
  });
}

/**
 * Get all items with alerts enabled (for background job)
 */
export async function getItemsWithAlertsEnabled() {
  return db.bagItem.findMany({
    where: {
      alertEnabled: true,
    },
    include: {
      productOffer: {
        include: {
          product: true,
          merchant: true,
        },
      },
      bag: {
        include: {
          child: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Enable alerts for a bag item
 */
export async function enableAlerts(itemId: string) {
  return db.bagItem.update({
    where: { id: itemId },
    data: {
      alertEnabled: true,
    },
  });
}

/**
 * Disable alerts for a bag item
 */
export async function disableAlerts(itemId: string) {
  return db.bagItem.update({
    where: { id: itemId },
    data: {
      alertEnabled: false,
    },
  });
}
