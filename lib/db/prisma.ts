/**
 * Prisma client
 * 作用：提供全局复用的 PrismaClient，避免开发环境热重载产生连接风暴。
 * 联动：repository 层、API route、service 层。
 * 层级：repository
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

