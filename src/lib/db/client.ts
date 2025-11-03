import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In development, append pgbouncer=true to disable prepared statements
// This prevents "prepared statement already exists" errors during hot reloads
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return undefined;

  if (process.env.NODE_ENV === "development") {
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
