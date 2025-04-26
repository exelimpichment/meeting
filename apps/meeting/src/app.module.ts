import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@libs/config';
import { envSchema } from './env.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/meeting/.env',
      validate: (env) => envSchema.parse(env),
    }),
    ConfigModule,
    ClientsModule.register([
      {
        name: 'MEETING_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
