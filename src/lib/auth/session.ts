import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Get the current user's Clerk ID
 * @returns The Clerk user ID or null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication and return the user ID
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Unauthorized: User must be authenticated");
  }
  return userId;
}

/**
 * Get the current user's details
 */
export async function getCurrentUser() {
  return await currentUser();
}

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getUserId();
  return userId !== null;
}
