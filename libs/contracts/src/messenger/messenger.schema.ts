import { z } from 'zod';

// export const writingMessageSchema = z.object({
//   groupId: z.string().uuid(),
//   userId: z.string().uuid(),
// });

export const sendMessageSchema = z.object({
  groupId: z.string().uuid(),
  message: z.string(),
});

export const deleteMessageSchema = z.object({
  groupId: z.string().uuid(),
  messageId: z.string().uuid(),
});

export const editMessageSchema = z.object({
  groupId: z.string().uuid(),
  messageId: z.string().uuid(),
  message: z.string(),
});

// export const getMessagesSchema = z.object({
//   conversationId: z.string().uuid(),
// });

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type DeleteMessageDto = z.infer<typeof deleteMessageSchema>;
export type EditMessageDto = z.infer<typeof editMessageSchema>;
