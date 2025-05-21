import { Module } from '@nestjs/common';
// import { ClientsModule, Transport } from '@nestjs/microservices'; // Removed
import { MessengerGateway } from './messenger.gateway';
import { KafkaModule } from '../kafka/kafka.module'; // Added KafkaModule import

@Module({
  imports: [
    KafkaModule, // Added KafkaModule
    // ClientsModule.register([ // Removed ClientsModule registration
    //   {
    //     name: 'MEETING_SERVICE',
    //     transport: Transport.TCP, // Assuming TCP, adjust if different
    //     // Add options like host and port if necessary
    //     // options: { host: 'localhost', port: 3001 },
    //   },
    // ]),
  ],
  providers: [MessengerGateway],
  exports: [MessengerGateway], // Export if other modules need to use it directly
})
export class MessengerModule {}
