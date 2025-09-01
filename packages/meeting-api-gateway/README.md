# @packages/meeting-api-gateway

Shared Prisma client and types for the meeting API gateway service.

## Installation

This package should be installed as a dependency in your projects that need access to the meeting API gateway database schema and types.

## Usage

```typescript
import { prisma, users, Prisma } from '@packages/meeting-api-gateway';

// use the prisma client
const user = await prisma.users.findUnique({
  where: { email: 'user@example.com' },
});

// use the types
type User = Prisma.usersCreateInput;
```

## Environment Variables

Make sure to set the following environment variable:

- `DATABASE_URL`: MySQL connection string for the meeting auth database

## Scripts

- `npm run generate`: Generate Prisma client
- `npm run build`: Build TypeScript files
- `npm run introspect`: Pull database schema from existing database
