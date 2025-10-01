// ===== Kafka module =====
export const MESSENGER_WS_GATEWAY_CLIENT = 'MESSENGER_WS_GATEWAY_CLIENT';

// ===== Messages module =====
export const MessageEventType = {
  SEND: 'message.send',
  EDIT: 'message.edit',
  DELETE: 'message.delete',
} as const;
