import type {
  conversations,
  messages,
  users,
  users_conversations,
  ConversationRole,
} from './generated/messenger';

import type { users as IamUser } from './generated/iam';

// export types directly for type annotations
export type MessengerConversation = conversations;
export type MessengerMessage = messages;
export type MessengerUser = users;
export type MessengerUserConversation = users_conversations;
export type MessengerConversationRole = ConversationRole;

export type MessageWithUser = Omit<MessengerMessage, 'users'> & {
  users: IamUser;
};

export type ConversationWithMessage = Omit<
  MessengerConversation,
  'messages'
> & {
  messages: MessengerMessage[];
};

export type ApiResponses = {
  'GET /api/conversations/:id/messages': MessageWithUser[];
  'GET api/conversations': ConversationWithMessage[];
};
