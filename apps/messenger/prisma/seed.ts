import { PrismaClient } from '../generated/messenger-client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const alice = await prisma.users.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice',
      last_name: 'Doe',
      email: 'alice@example.com',
      image_url: 'https://example.com/alice.jpg',
    },
  });

  const bob = await prisma.users.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob',
      last_name: 'Smith',
      email: 'bob@example.com',
      image_url: 'https://example.com/bob.jpg',
    },
  });

  // Create conversation
  const conversation = await prisma.conversations.create({
    data: {
      name: 'General Chat',
      creator_id: alice.id,
      users_conversations: {
        create: [
          {
            user_id: alice.id,
            role: 'CREATOR',
          },
          {
            user_id: bob.id,
            role: 'PARTICIPANT',
          },
        ],
      },
    },
  });

  // Create messages
  await prisma.messages.createMany({
    data: [
      {
        conversation_id: conversation.id,
        user_id: alice.id,
        content: 'Hello Bob!',
      },
      {
        conversation_id: conversation.id,
        user_id: bob.id,
        content: 'Hi Alice, how are you?',
      },
    ],
  });

  console.log({ alice, bob, conversation });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
