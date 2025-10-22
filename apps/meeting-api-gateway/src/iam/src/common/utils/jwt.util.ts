import { jwtConfig } from '@/libs/shared-authentication/src/configs/jwt-config';
import { ConfigType } from '@nestjs/config';

export function getCookieOptions(
  jwt: ConfigType<typeof jwtConfig>,
  type: 'access' | 'refresh',
) {
  const environment = process.env.NODE_ENV || 'development';
  const ttlSeconds =
    type === 'access'
      ? Number(jwt.JWT_ACCESS_TOKEN_TTL)
      : Number(jwt.JWT_REFRESH_TOKEN_TTL);
  return {
    httpOnly: true,
    secure: environment !== 'development',
    sameSite: 'strict' as const,
    maxAge: ttlSeconds * 1000,
    path: '/',
  };
}
