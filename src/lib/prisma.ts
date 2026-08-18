import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Works for both local dev (file:./dev.db, no token needed) and Turso in production
// (libsql://..., with TURSO_AUTH_TOKEN) — same driver adapter either way.
const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL ?? "file:./prisma/dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
