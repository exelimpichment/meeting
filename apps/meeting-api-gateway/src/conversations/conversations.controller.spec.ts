import { ConversationsController } from '@/apps/meeting-api-gateway/src/conversations/conversations.controller';
import { ConversationsService } from '@/apps/meeting-api-gateway/src/conversations/conversations.service';
import { MEETING_API_NATS_CLIENT } from '@/apps/meeting-api-gateway/src/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { KeyvCacheService } from '@/libs/cache';
import { JwtPayload } from '@/libs/shared-authentication/src/types';

import { PatchConversationBody } from '@/libs/contracts/src/messenger/conversations.schema';
import { MessengerConversation } from '@exelimpichment/prisma-types';

describe('ConversationsController', () => {
  let controller: ConversationsController;

  const mockJwtPayload: JwtPayload = {
    sub: 'b8b3e3eb-ad07-4a04-9e86-ef6ad6069c27', // user ID (required)
    email: 'test@example.com', // user email (required)
    iat: Math.floor(Date.now() / 1000), // issued at timestamp (required)
    exp: Math.floor(Date.now() / 1000) + 3600, // expiration timestamp (required)
    aud: 'your-audience', // audience (required)
    iss: 'your-issuer', // issuer (required)
    jti: 'optional-jwt-id', // optional JWT ID
  };

  const mockConversations: MessengerConversation[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Team Chat',
      created_at: new Date('2025-10-01 19:59:10.000'),
      updated_at: new Date('2025-10-19 10:09:19.460'),
      creator_id: 'b8b3e3eb-ad07-4a04-9e86-ef6ad6069c27',
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Project Discussion',
      created_at: new Date('2025-10-02 10:00:00.000'),
      updated_at: new Date('2025-10-20 15:30:00.000'),
      creator_id: null,
    },
  ];

  const mockConversation: MessengerConversation = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Updated Conversation Name',
    created_at: new Date('2025-10-01 19:59:10.000'),
    updated_at: new Date('2025-10-19 10:09:19.460'),
    creator_id: 'b8b3e3eb-ad07-4a04-9e86-ef6ad6069c27',
  };

  const mockPatchBody: PatchConversationBody = {
    name: 'New Conversation Name',
  };

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
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });
});
