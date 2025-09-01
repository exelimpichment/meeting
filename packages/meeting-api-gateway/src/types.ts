// Re-export all Prisma types and client
export * from '../generated/index';
export { PrismaClient } from '../generated/index';

// Export specific types for convenience
export type { users, Prisma } from '../generated/index';
