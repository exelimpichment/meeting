import { MEETING_API_NATS_CLIENT } from '@/apps/meeting-api-gateway/src/constants';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Test, TestingModule } from '@nestjs/testing';
import { KeyvCacheService } from '@/libs/cache';

describe('ConversationsController', () => {
  let controller: ConversationsController;

  beforeEach(async () => {
    // create mock for NATS client
    const mockNatsClient = {
      send: jest.fn(),
    };

    // create mock for cache service
    const mockKeyvCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        ConversationsService,
        {
          provide: MEETING_API_NATS_CLIENT,
          useValue: mockNatsClient,
        },
        {
          provide: KeyvCacheService,
          useValue: mockKeyvCacheService,
        },
      ],
    }).compile();

    controller = app.get<ConversationsController>(ConversationsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(controller).toBeDefined();
    });
  });
});
