import { MEETING_API_NATS_CLIENT } from '@/apps/meeting-api-gateway/src/consts';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [
    {
      provide: MEETING_API_NATS_CLIENT,
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            servers: ['nats://localhost:4222'],
          },
        });
      },
    },
  ],
  exports: [MEETING_API_NATS_CLIENT],
})
export class NatsModule {}
