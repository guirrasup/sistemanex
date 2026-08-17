import { logger } from "../logger";

let prismaInstance: any = null;

export function getPrismaClient(): any {
  if (!prismaInstance) {
    try {
      // Dynamic require to prevent tsc missing generated client build error
      const { PrismaClient } = require("@prisma/client");
      prismaInstance = new PrismaClient();
    } catch (e: any) {
      logger.warn("Prisma Client not initialized yet: " + e.message);
    }
  }
  return prismaInstance;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    if (client && typeof client.$queryRaw === "function") {
      await client.$queryRaw`SELECT 1`;
      logger.info("PostgreSQL Database Connection Established via Prisma");
      return true;
    }
    logger.info("Prisma Database client standby (ready for PostgreSQL instance connection)");
    return false;
  } catch (error: any) {
    logger.warn("Prisma DB Direct Query Fallback (using mock/in-memory persistent state): " + error.message);
    return false;
  }
}
