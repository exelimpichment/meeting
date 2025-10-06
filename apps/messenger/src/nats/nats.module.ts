import { Global, Module } from '@nestjs/common';
import { NatsService } from '@/apps/messenger/src/nats/nats.service';
import { ConfigModule } from '@/libs/config/src/config.module';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [NatsService],
  exports: [NatsService],
})
export class NatsModule {}
