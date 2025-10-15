export type ReadConversationsPayload = {
  userId: string;
};

export type EditConversationPayload = {
  userId: string;
  conversationId: string;
  name: string;
};
