import { IAmPrismaService } from '@/apps/meeting-api-gateway/src/iam/src/prisma';
import { Injectable } from '@nestjs/common';

interface CreateRefreshTokenPayload {
  jti: string;
  hashedToken: string;
  userId: string;
  expiresAt: Date;
  parentId?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class RefreshTokensRepository {
  constructor(private readonly prisma: IAmPrismaService) {}

  async create(payload: CreateRefreshTokenPayload) {
    const { jti, hashedToken, userId, expiresAt, parentId, ip, userAgent } =
      payload;

    return await this.prisma.refresh_tokens.create({
      data: {
        jti,
        hashedToken,
        userId,
        expiresAt,
        parentId,
        ip,
        userAgent,
      },
    });
  }

  async findByJti(jti: string) {
    return await this.prisma.refresh_tokens.findUnique({ where: { jti } });
  }

  async revokeById(id: string) {
    return await this.prisma.refresh_tokens.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async markAsUsed(id: string) {
    return await this.prisma.refresh_tokens.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string) {
    return await this.prisma.refresh_tokens.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
