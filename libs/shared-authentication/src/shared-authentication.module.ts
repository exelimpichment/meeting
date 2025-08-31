import { HttpAccessTokenGuard } from './guards/http-access-token.guard';
import { WsAccessTokenGuard } from './guards/ws-access-token.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { REQUEST_USER_KEY } from './constants';
import { jwtConfig } from './configs/jwt-config';
import { jwtEnvSchema } from './configs/jwt-env.schema';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModule as LibsConfigModule } from '@/libs/config/src/config.module';

import { ConfigService as NestConfigService } from '@nestjs/config';
import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({})
export class SharedAuthenticationModule {
  static REQUEST_USER_KEY = REQUEST_USER_KEY;

  static forRoot(): DynamicModule {
    return {
      module: SharedAuthenticationModule,
      imports: [
        LibsConfigModule,
        // provide jwt configuration for guards injection
        NestConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync({
          useFactory: (nestConfigService: NestConfigService) => {
            // validate JWT environment variables here using NestJS ConfigService
            const rawJwtConfig = {
              JWT_ACCESS_TOKEN_SECRET: nestConfigService.get(
                'JWT_ACCESS_TOKEN_SECRET',
              ),
              JWT_ACCESS_TOKEN_AUDIENCE: nestConfigService.get(
                'JWT_ACCESS_TOKEN_AUDIENCE',
              ),
              JWT_ACCESS_TOKEN_ISSUER: nestConfigService.get(
                'JWT_ACCESS_TOKEN_ISSUER',
              ),
              JWT_ACCESS_TOKEN_TTL: nestConfigService.get(
                'JWT_ACCESS_TOKEN_TTL',
              ),
            };

            const validationResult = jwtEnvSchema.safeParse(rawJwtConfig);

            if (!validationResult.success) {
              console.error(
                'JWT Environment validation error:',
                validationResult.error.flatten().fieldErrors,
              );
              throw new Error('Invalid JWT environment variables');
            }

            return {
              secret: rawJwtConfig.JWT_ACCESS_TOKEN_SECRET,
              signOptions: {
                audience: rawJwtConfig.JWT_ACCESS_TOKEN_AUDIENCE,
                issuer: rawJwtConfig.JWT_ACCESS_TOKEN_ISSUER,
                expiresIn: parseInt(
                  rawJwtConfig.JWT_ACCESS_TOKEN_TTL || '3600',
                ),
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
