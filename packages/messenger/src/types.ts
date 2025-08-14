// Re-export all Prisma types and client
export * from '../generated/index';
export { PrismaClient } from '../generated/index';

// Export specific types for convenience
export type {
  users,
  messages,
  conversations,
  users_conversations,
  Prisma,
} from '../generated/index';
