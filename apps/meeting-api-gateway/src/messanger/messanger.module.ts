import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessangerGateway } from './messanger.gateway';

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
  providers: [MessangerGateway],
  exports: [MessangerGateway], // Export if other modules need to use it directly
})
export class MessangerModule {}
