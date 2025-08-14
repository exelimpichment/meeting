import { PrismaClient } from '@prisma/client';

// create prisma client instance
const prisma = new PrismaClient();

// export the prisma client context
export { prisma };

// export all types and utilities
export * from './types';

// export a context creator function for convenience
export function createContext(): { prisma: PrismaClient } {
  return { prisma };
}
