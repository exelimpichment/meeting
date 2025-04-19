import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@app/config';
import { envSchema } from './env.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/meeting/.env',
      validate: (env) => envSchema.parse(env),
    }),
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
