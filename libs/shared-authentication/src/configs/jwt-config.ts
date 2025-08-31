import { registerAs } from '@nestjs/config';
import { ConfigService } from '@/libs/config/src/config.service';
import { JwtEnv } from './jwt-env.schema';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_ACCESS_TOKEN_SECRET,
  audience: process.env.JWT_ACCESS_TOKEN_AUDIENCE,
  issuer: process.env.JWT_ACCESS_TOKEN_ISSUER,
  accessTokenTtl: process.env.JWT_ACCESS_TOKEN_TTL,
}));

// factory function that uses your custom ConfigService
export const createJwtConfig = (configService: ConfigService<JwtEnv>) => ({
  secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
  audience: configService.get('JWT_ACCESS_TOKEN_AUDIENCE'),
  issuer: configService.get('JWT_ACCESS_TOKEN_ISSUER'),
  accessTokenTtl: configService.get('JWT_ACCESS_TOKEN_TTL'),
});
