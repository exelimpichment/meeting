import { MessengerModule } from '@/apps/messenger/src/messenger.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(MessengerModule);
  await app.listen(3003);
}
bootstrap();
