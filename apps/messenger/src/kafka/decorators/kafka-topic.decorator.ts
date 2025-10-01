import { SetMetadata } from '@nestjs/common';
import { KAFKA_TOPIC_METADATA } from '../constants';

/**
 * decorator to mark a method as a Kafka topic handler
 * @param topic - the Kafka topic name to listen to
 */
export const KafkaTopic = (topic: string) =>
  SetMetadata(KAFKA_TOPIC_METADATA, topic);
