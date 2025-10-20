import { HttpAccessTokenGuard } from '@/libs/shared-authentication/src/guards/http-access-token.guard';
import { WsAccessTokenGuard } from '@/libs/shared-authentication/src/guards/ws-access-token.guard';
import { AuthenticationGuard } from '@/libs/shared-authentication/src/guards/authentication.guard';
import { ConfigModule as CustomConfigModule } from '@/libs/config/src/config.module';
import { REQUEST_USER_KEY } from '@/libs/shared-authentication/src/constants';
import { jwtConfig } from '@/libs/shared-authentication/src/configs/jwt-config';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { JwtEnvSchema } from '@/libs/shared-authentication/src/types';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

/*
 * Global Authentication Module - Import once in your root module and it will be available everywhere.
 *
 * Usage: Import SharedAuthenticationModule.forRoot() in your main application module (e.g., AppModule).
 * Once imported, all guards (AuthenticationGuard, HttpAccessTokenGuard, WsAccessTokenGuard) and
 * JwtModule will be available throughout your application without additional imports.
 *
 * Required Environment Variables:
 * - JWT_ACCESS_TOKEN_SECRET: Secret key for signing JWT access tokens
 * - JWT_ACCESS_TOKEN_AUDIENCE: Intended audience for the JWT tokens
 * - JWT_ACCESS_TOKEN_ISSUER: Issuer identifier for the JWT tokens
 * - JWT_ACCESS_TOKEN_TTL: Time-to-live for access tokens
 *
 * Ensure these variables are present and validated in your config schema in the importing module.
 *
 * Also use jwt-env.schema in the importing module to validate the environment variables.
 */

@Global()
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

            if (!jwtConfigValues) {
              throw new Error(
                'JWT configuration not found. Ensure environment variables are properly validated.',
              );
            }

            return {
              secret: jwtConfigValues.JWT_ACCESS_TOKEN_SECRET,
              signOptions: {
                audience: jwtConfigValues.JWT_ACCESS_TOKEN_AUDIENCE,
                issuer: jwtConfigValues.JWT_ACCESS_TOKEN_ISSUER,
                expiresIn: jwtConfigValues.JWT_ACCESS_TOKEN_TTL,
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
      exports: [
        AuthenticationGuard,
        HttpAccessTokenGuard,
        WsAccessTokenGuard,
        JwtModule,
        ConfigModule, // export ConfigModule so JWT config is available
      ],
    };
  }
}
