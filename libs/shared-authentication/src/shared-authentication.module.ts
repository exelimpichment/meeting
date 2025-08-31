import { HttpAccessTokenGuard } from './guards/http-access-token.guard';
import { WsAccessTokenGuard } from './guards/ws-access-token.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { REQUEST_USER_KEY } from './constants';
import { jwtConfig } from './configs/jwt-config';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: (config: ReturnType<typeof jwtConfig>) => ({
        secret: config.secret,
        signOptions: {
          audience: config.audience,
          issuer: config.issuer,
          expiresIn: config.accessTokenTtl,
        },
      }),
      inject: [jwtConfig.KEY],
    }),
  ],
  providers: [AuthenticationGuard, HttpAccessTokenGuard, WsAccessTokenGuard],
  exports: [AuthenticationGuard, HttpAccessTokenGuard, WsAccessTokenGuard],
})
export class SharedAuthenticationModule {
  static REQUEST_USER_KEY = REQUEST_USER_KEY;
}
