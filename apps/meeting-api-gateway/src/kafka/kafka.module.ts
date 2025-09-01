import { Module } from '@nestjs/common';
import {
  ConfigModule as CustomConfigModule,
  ConfigService as CustomConfigService,
} from '@nestjs/config';
import { ClientsModule, Transport, KafkaOptions } from '@nestjs/microservices';
import { KafkaProducerService } from './kafka.producer.service';
import { MeetingApiGatewayEnv } from '../../meeting-api-gateway.schema';
import { MEETING_API_SERVICE_CLIENT } from '../constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MEETING_API_SERVICE_CLIENT,
        imports: [CustomConfigModule],
        useFactory: (
          configService: CustomConfigService<MeetingApiGatewayEnv>,
        ): KafkaOptions => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'meeting-api-gateway-producer',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            producer: {
              allowAutoTopicCreation: true,
            },
          },
        }),
        inject: [CustomConfigService],
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
