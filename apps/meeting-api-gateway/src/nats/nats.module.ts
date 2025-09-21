import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@libs/config/src/config.module';
import { ConfigService } from '@libs/config/src/config.service';
import { MEETING_API_NATS_CLIENT } from '../constants';
import { MeetingApiGatewayEnv } from '../../meeting-api-gateway.schema';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MEETING_API_NATS_CLIENT,
      useFactory: (configService: ConfigService<MeetingApiGatewayEnv>) => {
        const natsUrl = configService.get('NATS_URL');
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            servers: [natsUrl],
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [MEETING_API_NATS_CLIENT],
})
export class NatsModule {}
