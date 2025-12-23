/**
 * Database Client
 * 
 * This file creates a single database connection that's reused
 * across the entire app. This prevents creating too many connections.
 */

import { PrismaClient } from "@prisma/client";

// TypeScript trick to store the client globally
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reuse existing connection or create a new one
export const db = globalForPrisma.prisma ?? new PrismaClient();

// In development, save the client globally to survive hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

