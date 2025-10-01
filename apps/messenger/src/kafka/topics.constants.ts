//TODO: move to shared package or smth

// kafka topic names for message events
export const KAFKA_TOPICS = {
  MESSAGE_SEND: 'messenger.message.send',
  MESSAGE_EDIT: 'messenger.message.edit',
  MESSAGE_DELETE: 'messenger.message.delete',
} as const;

export type KafkaTopicName = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];
