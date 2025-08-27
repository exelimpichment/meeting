import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { KafkaModule } from '../../kafka/kafka.module';
import { WsAuthService } from '../../common/ws-auth.service';
import { AuthenticationModule } from '../../iam/src/authentication/authentication.module';

@Module({
  imports: [KafkaModule, AuthenticationModule],
  providers: [MessagesGateway, WsAuthService],
  exports: [MessagesGateway],
})
export class MessagesModule {}
