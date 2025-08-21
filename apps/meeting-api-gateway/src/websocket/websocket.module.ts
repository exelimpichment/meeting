import { AccessTokenGuard } from '@/apps/meeting-api-gateway/src/iam/src/authentication/guards';
import { jwtConfig } from 'apps/meeting-api-gateway/src/iam/jwt.config';
import { WebsocketGateway } from './websocket.gateway';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [WebsocketGateway, AccessTokenGuard],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
