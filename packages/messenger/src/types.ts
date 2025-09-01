import { conversations, messages, users } from '../generated/index';

export type MessageWithUser = messages & { users: users };
export type Conversation = conversations;

// API response types
export type ApiResponses = {
  'GET /api/conversations/:id/messages': MessageWithUser[];
  'GET api/conversations': Conversation[];
};
