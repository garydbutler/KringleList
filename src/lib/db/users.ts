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
  const existingUser = await getUserByClerkId(clerkId);

  if (existingUser) {
    return existingUser;
  }

  return createUser({ clerkId, email });
}
