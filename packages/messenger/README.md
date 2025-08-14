# @packages/messenger

Shared Prisma client and types for the messenger service.

## Installation

This package should be installed as a dependency in your projects that need access to the messenger database schema and types.

## Usage

```typescript
import {
  prisma,
  messages,
  users,
  conversations,
  users_conversations,
  Prisma,
} from '@packages/messenger';

// use the prisma client
const messages = await prisma.messages.findMany({
  where: { conversation_id: 'conversation-id' },
  include: { users: true, conversation: true },
});

// use the types
type Message = Prisma.messagesCreateInput;
type User = Prisma.usersCreateInput;
type Conversation = Prisma.conversationsCreateInput;
```

## Environment Variables

Make sure to set the following environment variable:

- `DATABASE_URL`: MySQL connection string for the messenger database

## Scripts

- `npm run generate`: Generate Prisma client
- `npm run build`: Build TypeScript files
- `npm run introspect`: Pull database schema from existing database
