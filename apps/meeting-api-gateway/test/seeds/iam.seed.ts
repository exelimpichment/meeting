import { PrismaClient } from '../../src/iam/generated/iam-client';
import * as bcrypt from 'bcryptjs';

const testUserId = 'test-user-id';
const testUserEmail = 'test@example.com';

export async function seedIam(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.users.upsert({
    where: { email: testUserEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      id: testUserId,
      email: testUserEmail,
      password: hashedPassword,
    },
  });

  return { user };
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedIam(prisma)
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
