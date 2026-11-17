import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 talks to the database through a "driver adapter".
// We use the standard node-postgres (pg) adapter, which speaks the normal
// Postgres TCP protocol. That means the SAME code works against:
//   - the local Docker container  (postgresql://...@db:5432/haven)
//   - Neon in the cloud           (postgresql://...neon.tech/...?sslmode=require)
// (The previous Neon adapter used Neon's WebSocket proxy, which a plain
//  Postgres container does not have.)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

// In development, Next.js hot-reloads modules; caching the client on
// globalThis stops us from opening a new connection pool on every reload.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
