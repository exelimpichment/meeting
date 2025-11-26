import { MeetingApiGatewayModule } from '@/apps/meeting-api-gateway/src/meeting-api-gateway.module';
import { MEETING_API_KAFKA_CLIENT } from '@/apps/meeting-api-gateway/src/constants';
import { MessengerModule } from '@/apps/messenger/src/messenger.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import {
  KAFKA_CONSUMER_TOKEN,
  KAFKA_PRODUCER_TOKEN,
  KAFKA_ADMIN_CLIENT_TOKEN,
} from '@/apps/messenger/src/kafka/constants';

describe('MeetingApiGatewayController (e2e)', () => {
  let app: INestApplication;
  let messengerApp: INestMicroservice;
  let jwtService: JwtService;

  // Ensure required env vars for Messenger are present
  beforeAll(() => {
    process.env.KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'test-group';
  });

  beforeEach(async () => {
    // 1. Initialize Messenger Microservice (Real Implementation)
    const messengerFixture: TestingModule = await Test.createTestingModule({
      imports: [MessengerModule],
    })
      // mock Kafka clients to avoid connection errors if Kafka is not running
      // (remove these overrides if you want to test Kafka integration too)
      .overrideProvider(KAFKA_CONSUMER_TOKEN)
      .useValue({
        connect: jest.fn(),
        disconnect: jest.fn(),
        subscribe: jest.fn(),
        run: jest.fn(),
        on: jest.fn(),
      })
      .overrideProvider(KAFKA_PRODUCER_TOKEN)
      .useValue({
        connect: jest.fn(),
        disconnect: jest.fn(),
        send: jest.fn(),
      })
      .overrideProvider(KAFKA_ADMIN_CLIENT_TOKEN)
      .useValue({ connect: jest.fn(), disconnect: jest.fn() })
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
      // We do NOT mock MEETING_API_NATS_CLIENT so it talks to the real Messenger service
      // Mock Kafka client for the Gateway
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

    // Get JwtService to generate tokens for tests
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    if (messengerApp) {
      await messengerApp.close();
    }
  });

  test('/e2e-test (GET)', () => {
    return request(app.getHttpServer())
      .get('/e2e-test')
      .expect(200)
      .expect({ message: 'Hello World!' });
  });

  test.skip('conversations/ (GET)', async () => {
    // Example GET test
    const userId = 'test-user-id';
    const token = jwtService.sign({ sub: userId, email: 'test@example.com' });

    await request(app.getHttpServer())
      .get('/conversations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test.skip('/conversations/:conversationId (PATCH)', async () => {
    const userId = 'test-user-id';
    const conversationId = 'test-conversation-id';

    // Note: You might need to seed the database with this conversation first
    // so that the Messenger service can find and update it.

    const token = jwtService.sign({ sub: userId, email: 'test@example.com' });

    await request(app.getHttpServer())
      .patch(`/conversations/${conversationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' })
      .expect(200); // Or 404 if not found in DB
  });
});
