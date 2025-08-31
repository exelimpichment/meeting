import { ConfigModule as CustomConfigModule } from '@/libs/config/src/config.module';
import { HttpAccessTokenGuard } from './guards/http-access-token.guard';
import { WsAccessTokenGuard } from './guards/ws-access-token.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { DynamicModule, Module } from '@nestjs/common';
import { jwtEnvSchema } from './configs/jwt-env.schema';
import { REQUEST_USER_KEY } from '@/libs/shared-authentication/src/constants';
import { jwtConfig } from './configs/jwt-config';
import { JwtModule } from '@nestjs/jwt';
import { JwtEnvSchema } from './types';

@Module({})
export class SharedAuthenticationModule {
  static REQUEST_USER_KEY = REQUEST_USER_KEY;

  static forRoot(): DynamicModule {
    return {
      module: SharedAuthenticationModule,
      imports: [
        CustomConfigModule,

        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync({
          useFactory: (nestConfigService: NestConfigService) => {
            const jwtConfigValues = nestConfigService.get<JwtEnvSchema>('jwt');

            const validatedJwtConfigValues =
              jwtEnvSchema.parse(jwtConfigValues);

            return {
              secret: validatedJwtConfigValues.JWT_ACCESS_TOKEN_SECRET,
              signOptions: {
                audience: validatedJwtConfigValues.JWT_ACCESS_TOKEN_AUDIENCE,
                issuer: validatedJwtConfigValues.JWT_ACCESS_TOKEN_ISSUER,
                expiresIn: validatedJwtConfigValues.JWT_ACCESS_TOKEN_TTL,
              },
            };
          },
          inject: [NestConfigService],
        }),
      ],
      providers: [
        AuthenticationGuard,
        HttpAccessTokenGuard,
        WsAccessTokenGuard,
      ],
      exports: [AuthenticationGuard, HttpAccessTokenGuard, WsAccessTokenGuard],
    };
  }
}
