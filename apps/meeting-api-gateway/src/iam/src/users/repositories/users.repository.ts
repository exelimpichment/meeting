import { IAmPrismaService } from '@apps/meeting-api-gateway/src/iam/src/prisma';
import { users } from '@apps/meeting-api-gateway/src/iam/generated/iam-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: IAmPrismaService) {}

  async create(data: { email: string; passwordHash: string }): Promise<users> {
    return await this.prisma.users.create({
      data: {
        email: data.email,
        password: data.passwordHash,
      },
    });
  }
}
