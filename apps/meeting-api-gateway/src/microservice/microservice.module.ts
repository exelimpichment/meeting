import { Global, Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MEETING_SERVICE } from '@apps/meeting-api-gateway/src/consts';

@Global()
@Module({
  providers: [
    {
      provide: MEETING_SERVICE,
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
  exports: [MEETING_SERVICE],
})
export class MicroserviceModule {}
