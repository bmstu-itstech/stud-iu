import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
};

export const db = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
