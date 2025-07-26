import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'apps/meeting-api-gateway/src/iam/jwt.config';
import { AccessTokenGuard } from '@apps/meeting-api-gateway/src/iam/src/authentication/guards';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [WebsocketGateway, AccessTokenGuard],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
