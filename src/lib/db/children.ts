import { prisma } from "./client";
import { Child, AgeBand } from "@prisma/client";

export type CreateChildData = {
  userId: string;
  nickname: string;
  ageBand: AgeBand;
  interests: string[];
  values?: string[];
  budgetCents?: number;
};

export type UpdateChildData = {
  nickname?: string;
  ageBand?: AgeBand;
  interests?: string[];
  values?: string[];
  budgetCents?: number;
};

/**
 * Create a new child profile
 */
export async function createChild(data: CreateChildData): Promise<Child> {
  return prisma.child.create({
    data: {
      userId: data.userId,
      nickname: data.nickname,
      ageBand: data.ageBand,
      interests: data.interests,
      values: data.values || [],
      budgetCents: data.budgetCents,
    },
  });
}

/**
 * Get all children for a user
 */
export async function getChildren(userId: string) {
  return prisma.child.findMany({
    where: {
      userId,
    },
    include: {
      bag: {
        select: {
          id: true,
          shareToken: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get a single child by ID
 */
export async function getChildById(
  id: string,
  userId: string
): Promise<Child | null> {
  return prisma.child.findFirst({
    where: {
      id,
      userId,
    },
  });
}

/**
 * Update a child profile
 */
export async function updateChild(
  id: string,
  userId: string,
  data: UpdateChildData
): Promise<Child> {
  return prisma.child.update({
    where: {
      id,
      userId,
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

/**
 * Delete a child profile
 */
export async function deleteChild(id: string, userId: string): Promise<Child> {
  return prisma.child.delete({
    where: {
      id,
      userId,
    },
  });
}

/**
 * Get child count for a user
 */
export async function getChildCount(userId: string): Promise<number> {
  return prisma.child.count({
    where: {
      userId,
    },
  });
}
