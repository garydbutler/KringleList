import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Append pgbouncer=true to disable prepared statements
// This prevents "prepared statement already exists" errors in:
// - Development (hot reloads)
// - Vercel production (serverless connection pooling)
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return undefined;

  // Apply pgbouncer mode in development OR when running on Vercel
  const isVercel = process.env.VERCEL === "1";
  const shouldUsePgBouncer = process.env.NODE_ENV === "development" || isVercel;

  if (shouldUsePgBouncer) {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}pgbouncer=true`;
  }

  return baseUrl;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasourceUrl: getDatabaseUrl(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
