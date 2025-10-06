import { MessengerWsGatewayEnv } from '@/apps/messenger-ws-gateway/messenger-ws-gateway.schema';
import { ConfigService } from '@/libs/config/src/config.service';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  connect,
  NatsConnection,
  StringCodec,
  Subscription,
  SubscriptionOptions,
} from 'nats';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsService.name);
  private natsConnection: NatsConnection | null = null;
  private readonly stringCodec = StringCodec();

  constructor(private readonly config: ConfigService<MessengerWsGatewayEnv>) {}

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
    const payload = this.stringCodec.encode(JSON.stringify(data));
    this.natsConnection.publish(subject, payload);
  }

  subscribe(
    subject: string,
    handler: (payload: unknown) => void,
    options?: SubscriptionOptions,
  ): Subscription {
    if (!this.natsConnection)
      throw new Error('nats connection is not established');
    const sub = this.natsConnection.subscribe(subject, {
      ...options,
      callback: (err, msg) => {
        if (err) return;
        try {
          const decoded = this.stringCodec.decode(msg.data);
          handler(JSON.parse(decoded));
        } catch (error) {
          this.logger.warn('failed to decode nats message', error);
          this.logger.warn('failed to decode nats message');
        }
      },
    });
    return sub;
  }

  unsubscribe(sub: Subscription): void {
    sub.unsubscribe();
  }
}
