import { MessengerWsGatewayModule } from './messenger-ws-gateway.module';
import { getEnvConfig } from '@/apps/messenger-ws-gateway/messenger-ws-gateway.schema';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(MessengerWsGatewayModule);
  const configService = app.get(ConfigService);
  const env = getEnvConfig(configService);

  // configure WebSocket adapter to use ws driver
  app.useWebSocketAdapter(new WsAdapter(app));

  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true, // important for cookies
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(env.PORT);
  console.log(`Messenger WebSocket Gateway is running on port ${env.PORT}`);
  console.log(`- HTTP connections: http://localhost:${env.PORT}`);
  console.log(
    `- WebSocket connections: ws://localhost:${env.PORT}/ws/messages`,
  );
}

bootstrap().catch(console.error);
