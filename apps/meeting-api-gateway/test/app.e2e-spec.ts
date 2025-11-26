import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MeetingApiGatewayModule } from './../src/meeting-api-gateway.module';
import {
  MEETING_API_NATS_CLIENT,
  MEETING_API_KAFKA_CLIENT,
} from '@/apps/meeting-api-gateway/src/constants';

describe('MeetingApiGatewayController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MeetingApiGatewayModule],
    })
      // mock nats client to avoid connection attempts
      .overrideProvider(MEETING_API_NATS_CLIENT)
      .useValue({
        emit: jest.fn(),
        send: jest.fn(),
        connect: jest.fn(),
        close: jest.fn(),
      })
      // mock kafka client
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
    await app.close();
  });

  it('/e2e-test (GET)', () => {
    return request(app.getHttpServer())
      .get('/e2e-test')
      .expect(200)
      .expect({ message: 'Hello World!' });
  });
});
