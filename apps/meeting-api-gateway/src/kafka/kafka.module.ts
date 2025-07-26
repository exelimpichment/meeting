import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerService } from './kafka.producer.service';
import { MeetingApiGatewayEnv } from '../../meeting-api-gateway.schema';
import { MEETING_API_SERVICE_CLIENT } from '../constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MEETING_API_SERVICE_CLIENT, // Use the constant here
        imports: [ConfigModule], // Import ConfigModule here to use ConfigService in useFactory
        useFactory: (configService: ConfigService<MeetingApiGatewayEnv>) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'meeting-api-gateway-producer',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            producer: {
              // You can add kafkajs producer options here if needed
              // e.g., allowAutoTopicCreation: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
