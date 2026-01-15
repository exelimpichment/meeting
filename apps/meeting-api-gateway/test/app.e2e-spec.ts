import { MeetingApiGatewayModule } from '@/apps/meeting-api-gateway/src/meeting-api-gateway.module';
import { PrismaClient as MessengerPrismaClient } from '@/apps/messenger/generated/messenger-client';
import { MEETING_API_KAFKA_CLIENT } from '@/apps/meeting-api-gateway/src/constants';
import { seedMessenger } from '@/apps/meeting-api-gateway/test/seeds/messenger.seed';
import { cleanDatabase } from '@/apps/meeting-api-gateway/test/utils/db.utils';
import { MessengerModule } from '@/apps/messenger/src/messenger.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { KAFKA_CONSUMER_TOKEN } from '@/apps/messenger/src/kafka/constants';

describe('MeetingApiGatewayController (e2e)', () => {
  let app: INestApplication;
  let messengerApp: INestMicroservice;
  let messengerPrisma: MessengerPrismaClient;
  const testUserId = '00000000-0000-0000-0000-000000000001';

  // Mock Supabase JWT token (in real tests, you'd generate this from Supabase)
  const mockSupabaseToken = 'mock-supabase-jwt-token';

  beforeAll(async () => {
    jest.setTimeout(60000);
    process.env.KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'test-group';

    const messengerDatabaseUrl =
      process.env.MESSENGER_DATABASE_URL || process.env.DATABASE_URL;

    if (!messengerDatabaseUrl) {
      throw new Error(
        'MESSENGER_DATABASE_URL or DATABASE_URL is required for e2e tests',
      );
    }

    messengerPrisma = new MessengerPrismaClient({
      datasources: {
        db: {
          url: messengerDatabaseUrl,
        },
      },
    });

    await cleanDatabase(messengerPrisma);
    await seedMessenger(messengerPrisma);
  });

  beforeEach(async () => {
    // 1. Initialize Messenger Microservice (Real Implementation)
    const messengerFixture: TestingModule = await Test.createTestingModule({
      imports: [MessengerModule],
    })
      .overrideProvider(KAFKA_CONSUMER_TOKEN)
      .useValue({
        connect: jest.fn(),
        disconnect: jest.fn(),
        subscribe: jest.fn(),
        run: jest.fn(),
        on: jest.fn(),
      })
      .compile();

    messengerApp = messengerFixture.createNestMicroservice<MicroserviceOptions>(
      {
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4222'],
        },
      },
    );
    await messengerApp.listen();

    // 2. Initialize Meeting API Gateway
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MeetingApiGatewayModule],
    })
      .overrideProvider(MEETING_API_KAFKA_CLIENT)
      .useValue({
        emit: jest.fn(),
        send: jest.fn(),
        connect: jest.fn(),
        close: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    if (messengerApp) {
      await messengerApp.close();
    }
  });

  afterAll(async () => {
    await messengerPrisma?.$disconnect();
  });

  test('/e2e-test (GET)', () => {
    return request(app.getHttpServer())
      .get('/e2e-test')
      .expect(200)
      .expect({ message: 'Hello World!' });
  });

  // Note: These tests need a valid Supabase JWT token to work
  // In a real scenario, you'd either:
  // 1. Mock the Supabase strategy
  // 2. Use Supabase's API to generate test tokens
  // 3. Set up a test Supabase project

  test.skip('conversations/ (GET) - requires valid Supabase token', async () => {
    await request(app.getHttpServer())
      .get('/conversations')
      .set('Authorization', `Bearer ${mockSupabaseToken}`)
      .expect(200);
  });

  test.skip('/conversations/:conversationId (PATCH) - requires valid Supabase token', async () => {
    const conversationId = '00000000-0000-0000-0000-000000000002';

    await request(app.getHttpServer())
      .patch(`/conversations/${conversationId}`)
      .set('Authorization', `Bearer ${mockSupabaseToken}`)
      .send({ name: 'Updated Name' })
      .expect(200);
  });
});
