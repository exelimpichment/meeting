import { RefreshTokensRepository } from '@/apps/meeting-api-gateway/src/iam/src/refresh-tokens/refresh-tokens.repository';
import { UsersRepository } from '@/apps/meeting-api-gateway/src/iam/src/users/repositories/users.repository';
import { handlePrismaError } from '@/apps/meeting-api-gateway/src/iam/src/common/utils/prisma-error.util';
import { SignInDto } from '@/apps/meeting-api-gateway/src/iam/src/authentication/dto/sign-in.dto';
import { jwtConfig } from '@/libs/shared-authentication/src/configs/jwt-config';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtPayload } from '@/libs/shared-authentication/src/types';
import { HashingService } from '@/libs/hashing/src';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly refreshTokensRepository: RefreshTokensRepository,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signInDto: SignInDto) {
    const email = signInDto.email;
    const password = signInDto.password;

    const hashedPassword = await this.hashingService.hash(password);

    try {
      return await this.usersRepository.create({
        email,
        hashedPassword,
      });
    } catch (error: unknown) {
      handlePrismaError(error);
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersRepository.findOneByEmail(signInDto.email);

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    const isMatch = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Password does not match');
    }

    // generate access token
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        audience: this.jwtConfiguration.JWT_ACCESS_TOKEN_AUDIENCE,
        issuer: this.jwtConfiguration.JWT_ACCESS_TOKEN_ISSUER,
        secret: this.jwtConfiguration.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: `${this.jwtConfiguration.JWT_ACCESS_TOKEN_TTL}s`,
      },
    );

    // generate refresh token with jti
    const jti = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        jti,
      },
      {
        audience: this.jwtConfiguration.JWT_REFRESH_TOKEN_AUDIENCE,
        issuer: this.jwtConfiguration.JWT_REFRESH_TOKEN_ISSUER,
        secret: this.jwtConfiguration.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: `${this.jwtConfiguration.JWT_REFRESH_TOKEN_TTL}s`,
      },
    );

    const hashedRefresh = await this.hashingService.hash(refreshToken);

    const expiresAt = new Date(
      Date.now() + Number(this.jwtConfiguration.JWT_REFRESH_TOKEN_TTL) * 1000,
    );

    await this.refreshTokensRepository.create({
      jti,
      hashedToken: hashedRefresh,
      userId: user.id,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.jwtConfiguration.JWT_REFRESH_TOKEN_SECRET,
          audience: this.jwtConfiguration.JWT_REFRESH_TOKEN_AUDIENCE,
          issuer: this.jwtConfiguration.JWT_REFRESH_TOKEN_ISSUER,
        },
      );

      const jti = payload.jti;
      if (!jti) return;

      const record = await this.refreshTokensRepository.findByJti(jti);

      if (record) {
        await this.refreshTokensRepository.revokeById(record.id);
      }
    } catch {
      // ignore invalid token
    }
  }
}
