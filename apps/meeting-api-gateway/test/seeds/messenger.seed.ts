import { PrismaClient } from '../../../messenger/generated/messenger-client';

const testUserId = '00000000-0000-0000-0000-000000000001';
const testConversationId = '00000000-0000-0000-0000-000000000002';
const testUserEmail = 'test@example.com';

export async function seedMessenger(prisma: PrismaClient) {
  const primaryUser = await prisma.users.upsert({
    where: { email: testUserEmail },
    update: {
      name: 'Test',
      last_name: 'User',
      image_url: 'https://example.com/test-user.jpg',
    },
    create: {
      id: testUserId,
      name: 'Test',
      last_name: 'User',
      email: testUserEmail,
      image_url: 'https://example.com/test-user.jpg',
    },
  });

  const teammate = await prisma.users.upsert({
    where: { email: 'teammate@example.com' },
    update: {
      name: 'Teammate',
      last_name: 'Example',
      image_url: 'https://example.com/teammate.jpg',
    },
    create: {
      name: 'Teammate',
      last_name: 'Example',
      email: 'teammate@example.com',
      image_url: 'https://example.com/teammate.jpg',
    },
  });

  const conversation = await prisma.conversations.create({
    data: {
      id: testConversationId,
      name: 'General Chat',
      creator_id: primaryUser.id,
      users_conversations: {
        create: [
          {
            user_id: primaryUser.id,
            role: 'CREATOR',
          },
          {
            user_id: teammate.id,
            role: 'PARTICIPANT',
          },
        ],
      },
    },
  });

  await prisma.messages.createMany({
    data: [
      {
        conversation_id: conversation.id,
        user_id: primaryUser.id,
        content: 'Hello teammate!',
      },
      {
        conversation_id: conversation.id,
        user_id: teammate.id,
        content: 'Hi! Ready for our meeting?',
      },
    ],
  });

  return { primaryUser, teammate, conversation };
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedMessenger(prisma)
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
