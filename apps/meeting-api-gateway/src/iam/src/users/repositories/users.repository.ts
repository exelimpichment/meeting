import { IAmPrismaService } from '@/apps/meeting-api-gateway/src/iam/src/prisma';
import { CreateUserPayload } from '@/apps/meeting-api-gateway/src/iam/src/users/interfaces';
import { users } from '@/apps/meeting-api-gateway/src/iam/generated/iam-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: IAmPrismaService) {}

  async create({ email, hashedPassword }: CreateUserPayload): Promise<users> {
    return await this.prisma.users.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }

  async findOneByEmail(email: string): Promise<users | null> {
    return await this.prisma.users.findUnique({
      where: { email },
    });
  }
}
