export { PrismaClient as MeetingApiGatewayPrismaClient } from '../generated/index';

// export the prisma client instance
export declare const prisma: PrismaClient;

// export a context creator function
export declare function createContext(): { prisma: PrismaClient };

// re-export all Prisma types
export * from '../generated/index';

// export specific types for convenience
export type { users, Prisma } from '../generated/index';
