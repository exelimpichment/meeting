export type ReadConversationsPayload = {
  userId: string;
};

export type EditConversationPayload = {
  name: string;
  conversationId: string;
  userId: string;
};

export type PatchConversationBody = Pick<EditConversationPayload, 'name'>;
