import { prisma } from "./client";
import { User } from "@prisma/client";

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { clerkId },
  });
}

/**
 * Create a new user from Clerk webhook
 */
export async function createUser(data: {
  clerkId: string;
  email: string;
}): Promise<User> {
  return prisma.user.create({
    data: {
      clerkId: data.clerkId,
      email: data.email,
    },
  });
}

/**
 * Update user information
 */
export async function updateUser(
  clerkId: string,
  data: {
    email?: string;
  }
): Promise<User> {
  return prisma.user.update({
    where: { clerkId },
    data,
  });
}

/**
 * Get or create user (used in API routes)
 */
export async function getOrCreateUser(
  clerkId: string,
  email: string
): Promise<User> {
  // First try to find by clerkId
  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existingUser) {
    // Update email if changed
    if (existingUser.email !== email) {
      return prisma.user.update({
        where: { clerkId },
        data: { email },
      });
    }
    return existingUser;
  }

  // User doesn't exist, try to create
  try {
    return await prisma.user.create({
      data: {
        clerkId,
        email,
      },
    });
  } catch (error: any) {
    // If creation fails due to unique constraint, try to find by clerkId again
    // (handles race condition)
    if (error.code === 'P2002') {
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });
      if (user) {
        return user;
      }
    }
    throw error;
  }
}
