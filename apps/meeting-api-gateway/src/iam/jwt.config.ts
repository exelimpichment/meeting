import { registerAs } from '@nestjs/config';

// TODO: looks like it can be replaced with one from the shared library
export const jwtConfig = registerAs('jwt', () => ({
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_AUDIENCE: process.env.JWT_ACCESS_TOKEN_AUDIENCE,
  JWT_ACCESS_TOKEN_ISSUER: process.env.JWT_ACCESS_TOKEN_ISSUER,
  JWT_ACCESS_TOKEN_TTL: process.env.JWT_ACCESS_TOKEN_TTL,
}));
