import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_ACCESS_TOKEN_SECRET,
  audience: process.env.JWT_ACCESS_TOKEN_AUDIENCE,
  issuer: process.env.JWT_ACCESS_TOKEN_ISSUER,
  accessTokenTtl: process.env.JWT_ACCESS_TOKEN_TTL,
}));
