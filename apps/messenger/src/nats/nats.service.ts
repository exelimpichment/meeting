import { MessengerEnv } from '@/apps/messenger/env.schema';
import { ConfigService } from '@/libs/config/src/config.service';
import { connect, NatsConnection, StringCodec } from 'nats';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsService.name);
  private natsConnection: NatsConnection | null = null;
  private readonly sc = StringCodec();

  constructor(private readonly config: ConfigService<MessengerEnv>) {}

  async onModuleInit(): Promise<void> {
    const url = this.config.get('NATS_SERVER').trim();

    this.natsConnection = await connect({ servers: [url] });
    this.logger.log(`connected to nats at ${url}`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.natsConnection) {
      await this.natsConnection.drain();
      this.natsConnection = null;
    }
  }

  publish(subject: string, data: unknown) {
    if (!this.natsConnection)
      throw new Error('nats connection is not established');

    const payload = this.sc.encode(JSON.stringify(data));

    this.natsConnection.publish(subject, payload);
  }
}
