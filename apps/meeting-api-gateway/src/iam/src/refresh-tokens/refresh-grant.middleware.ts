import { RefreshTokensRepository } from '@/apps/meeting-api-gateway/src/iam/src/refresh-tokens/refresh-tokens.repository';
import { getCookieOptions } from '@/apps/meeting-api-gateway/src/iam/src/common/utils/jwt.util';
import { jwtConfig } from '@/libs/shared-authentication/src/configs/jwt-config';
import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { JwtPayload } from '@/libs/shared-authentication/src/types';
import { HashingService } from '@libs/hashing/src/hashing.service';
import { Request, Response, NextFunction } from 'express';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

/**
 * RefreshGrantMiddleware - Transparent token refresh middleware
 *
 * This middleware runs before authentication guards and automatically refreshes
 * expired access tokens using valid refresh tokens. It implements the "grant approach"
 * where token refresh happens transparently without requiring a dedicated endpoint.
 *
 * Security features:
 * - Token rotation: generates new refresh token on every use
 * - Reuse detection: revokes all tokens if old token is reused
 * - Hash verification: compares stored hash with presented token
 * - Expiry validation: checks both JWT and database expiry
 * - Revocation tracking: handles compromised token scenarios
 */
@Injectable()
export class RefreshGrantMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwt: ConfigType<typeof jwtConfig>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // STEP 1: Extract tokens from HTTP-only cookies
    const accessToken = req.cookies?.['access_token'] as string | undefined;
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;

    // STEP 2: Early exit if no access token present
    // Let the authentication guard handle the rejection
    if (!accessToken) return next();

    // STEP 3: Check if access token is still valid
    try {
      await this.jwtService.verifyAsync<JwtPayload>(accessToken, {
        secret: this.jwt.JWT_ACCESS_TOKEN_SECRET,
        audience: this.jwt.JWT_ACCESS_TOKEN_AUDIENCE,
        issuer: this.jwt.JWT_ACCESS_TOKEN_ISSUER,
      });
      // Access token is still valid - let the guard attach payload and continue
      return next();
    } catch {
      // Access token is expired/invalid - fall through to refresh logic
    }

    // STEP 4: Check if refresh token is available
    // If no refresh token, let the authentication guard handle the rejection
    if (!refreshToken) return next();

    // STEP 5: Attempt to refresh the access token using refresh token
    try {
      // STEP 5a: Verify refresh token JWT structure and signature
      const refreshPayload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.jwt.JWT_ACCESS_TOKEN_SECRET,
          audience: this.jwt.JWT_ACCESS_TOKEN_AUDIENCE,
          issuer: this.jwt.JWT_ACCESS_TOKEN_ISSUER,
        },
      );

      // STEP 5b: Extract required claims from refresh token
      const jti = refreshPayload?.jti; // JWT ID for database lookup
      const userId = refreshPayload?.sub; // User ID
      if (!jti || !userId) {
        // Missing required claims - invalid token format
        return next();
      }

      // STEP 5c: Look up refresh token record in database
      const record = await this.refreshTokensRepository.findByJti(jti);

      // STEP 5d: Security validation - Check if token exists in database
      if (!record) {
        // Token not found - possible reuse attack
        // Revoke all tokens for this user as security measure
        if (userId) await this.refreshTokensRepository.revokeAllForUser(userId);
        this.clearCookies(res);
        return next();
      }

      // STEP 5e: Security validation - Check if token is revoked
      if (record.revokedAt) {
        // Token was revoked - possible reuse attack
        // Revoke all tokens for this user as security measure
        await this.refreshTokensRepository.revokeAllForUser(userId);
        this.clearCookies(res);
        return next();
      }

      // STEP 5f: Security validation - Check if token is expired
      if (record.expiresAt < new Date()) {
        // Refresh token expired - just clear cookies, don't revoke all sessions
        // This is normal expiration, not a security threat
        this.clearCookies(res);
        return next();
      }

      // STEP 5g: Security validation - Verify token hash matches stored hash
      const matches = await this.hashingService.compare(
        refreshToken,
        record.hashedToken,
      );

      if (!matches) {
        // Hash mismatch - possible token tampering or reuse attack
        // Revoke all tokens for this user as security measure
        await this.refreshTokensRepository.revokeAllForUser(userId);
        this.clearCookies(res);
        return next();
      }

      // STEP 6: All security checks passed - proceed with token rotation

      // STEP 6a: Revoke the current refresh token (rotation)
      await this.refreshTokensRepository.revokeById(record.id);

      // STEP 6b: Generate new JTI for the new refresh token
      const newJti = randomUUID();

      // STEP 6c: Generate new access token
      const newAccessToken = await this.jwtService.signAsync(
        { sub: userId, email: refreshPayload.email },
        {
          audience: this.jwt.JWT_ACCESS_TOKEN_AUDIENCE,
          issuer: this.jwt.JWT_ACCESS_TOKEN_ISSUER,
          secret: this.jwt.JWT_ACCESS_TOKEN_SECRET,
          expiresIn: `${this.jwt.JWT_ACCESS_TOKEN_TTL}s`,
        },
      );

      // STEP 6d: Generate new refresh token with new JTI
      const newRefreshToken = await this.jwtService.signAsync(
        { sub: userId, email: refreshPayload.email, jti: newJti },
        {
          audience: this.jwt.JWT_ACCESS_TOKEN_AUDIENCE,
          issuer: this.jwt.JWT_ACCESS_TOKEN_ISSUER,
          secret: this.jwt.JWT_ACCESS_TOKEN_SECRET,
          expiresIn: `${this.jwt.JWT_REFRESH_TOKEN_TTL}s`,
        },
      );

      // STEP 6e: Hash the new refresh token for secure storage
      const hashed = await this.hashingService.hash(newRefreshToken);

      // STEP 6f: Calculate expiry date for new refresh token
      const expiresAt = new Date(
        Date.now() + Number(this.jwt.JWT_REFRESH_TOKEN_TTL) * 1000,
      );

      // STEP 6g: Store new refresh token in database
      await this.refreshTokensRepository.create({
        jti: newJti,
        hashedToken: hashed,
        userId,
        expiresAt,
        parentId: record.id, // Link to previous token for audit trail
        ip: req.ip, // Track IP for security monitoring
        userAgent: req.headers['user-agent'], // Track user agent for security monitoring
      });

      // STEP 7: Set new tokens as HTTP-only cookies
      res.cookie(
        'access_token',
        newAccessToken,
        getCookieOptions(this.jwt, 'access'),
      );
      res.cookie(
        'refresh_token',
        newRefreshToken,
        getCookieOptions(this.jwt, 'refresh'),
      );

      // STEP 8: Update request cookies for downstream guards
      // This ensures the authentication guard sees the new tokens
      if (req.cookies) {
        req.cookies['access_token'] = newAccessToken;
        req.cookies['refresh_token'] = newRefreshToken;
      }

      // STEP 9: Continue to next middleware/guard
      return next();
    } catch {
      // STEP 10: Refresh token verification failed
      // Clear cookies and let authentication guard handle the rejection
      this.clearCookies(res);
      return next();
    }
  }

  /**
   * Helper method to clear both access and refresh token cookies
   * Used when tokens are invalid, expired, or compromised
   */
  private clearCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
