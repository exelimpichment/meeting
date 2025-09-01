import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';
import { MEETING_API_NATS_CLIENT } from '../constants';

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
