import { PrismaClient } from '@prisma/client';

// Export the prisma client instance
export declare const prisma: PrismaClient;

// Export a context creator function
export declare function createContext(): { prisma: PrismaClient };

// Re-export all Prisma types
export * from '../generated/index';

// Export specific types for convenience
export type {
  users,
  messages,
  conversations,
  users_conversations,
  Prisma,
} from '../generated/index';
