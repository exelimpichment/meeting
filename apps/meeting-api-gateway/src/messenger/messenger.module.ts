import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessengerGateway } from './messenger.gateway';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MEETING_SERVICE',
        transport: Transport.TCP, // Assuming TCP, adjust if different
        // Add options like host and port if necessary
        // options: { host: 'localhost', port: 3001 },
      },
    ]),
  ],
  providers: [MessengerGateway],
  exports: [MessengerGateway], // Export if other modules need to use it directly
})
export class MessengerModule {}
