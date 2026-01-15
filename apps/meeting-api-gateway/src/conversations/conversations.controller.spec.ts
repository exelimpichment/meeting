import { ConversationsController } from '@/apps/meeting-api-gateway/src/conversations/conversations.controller';
import { ConversationsService } from '@/apps/meeting-api-gateway/src/conversations/conversations.service';
import { SupabaseAuthUser } from '@/libs/shared-authentication/src/types';
import { ConversationWithMessage } from '@exelimpichment/prisma-types';
import { Test, TestingModule } from '@nestjs/testing';

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let getConversationsMock: jest.Mock;
  let editConversationMock: jest.Mock;

  const mockUser: SupabaseAuthUser = {
    sub: 'b8b3e3eb-ad07-4a04-9e86-ef6ad6069c27',
    email: 'test@example.com',
  } as SupabaseAuthUser;

  const mockConversations: ConversationWithMessage[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Team Chat',
      created_at: new Date('2025-10-01 19:59:10.000'),
      updated_at: new Date('2025-10-19 10:09:19.460'),
      creator_id: 'b8b3e3eb-ad07-4a04-9e86-ef6ad6069c27',
      messages: [],
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Project Discussion',
      created_at: new Date('2025-10-02 10:00:00.000'),
      updated_at: new Date('2025-10-20 15:30:00.000'),
      creator_id: null,
      messages: [],
    },
  ];

  const mockEditedConversation: ConversationWithMessage = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Updated Conversation Name',
    created_at: new Date('2025-10-01 19:59:10.000'),
    updated_at: new Date('2025-10-19 10:09:19.460'),
    creator_id: 'b8b3e3eb-ad07-4a04-9e86-ef6ad6069c27',
    messages: [],
  };

  beforeEach(async () => {
    getConversationsMock = jest.fn();
    editConversationMock = jest.fn();

    const mockService = {
      getConversations: getConversationsMock,
      editConversation: editConversationMock,
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = app.get(ConversationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('root', () => {
    test('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('getConversations', () => {
    test('should return conversations from service', async () => {
      // arrange
      getConversationsMock.mockResolvedValue(mockConversations);

      // act
      const result = await controller.getConversations(mockUser);

      // assert
      expect(getConversationsMock).toHaveBeenCalledWith(mockUser.sub);
      expect(getConversationsMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockConversations);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Team Chat');
      expect(result[1].name).toBe('Project Discussion');
    });

    test('should return empty array when service returns empty array', async () => {
      // arrange
      const emptyResult: ConversationWithMessage[] = [];
      getConversationsMock.mockResolvedValue(emptyResult);

      // act
      const result = await controller.getConversations(mockUser);

      // assert
      expect(getConversationsMock).toHaveBeenCalledWith(mockUser.sub);
      expect(getConversationsMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(emptyResult);
      expect(result).toHaveLength(0);
    });

    test('should propagate error when service throws', async () => {
      // arrange
      const serviceError = new Error('Service unavailable');
      getConversationsMock.mockRejectedValue(serviceError);

      // act & assert
      await expect(controller.getConversations(mockUser)).rejects.toThrow(
        'Service unavailable',
      );

      expect(getConversationsMock).toHaveBeenCalledWith(mockUser.sub);
      expect(getConversationsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('editConversation', () => {
    test('should edit conversation', async () => {
      // arrange
      const mockConversationId = '550e8400-e29b-41d4-a716-446655440000';
      const mockBody = {
        name: 'Updated Conversation Name',
      };

      editConversationMock.mockResolvedValue(mockEditedConversation);

      // act
      const result = await controller.editConversation(
        mockUser,
        mockConversationId,
        mockBody,
      );

      // assert
      expect(editConversationMock).toHaveBeenCalledWith(mockUser.sub, {
        name: mockBody.name,
        conversationId: mockConversationId,
        userId: mockUser.sub,
      });

      expect(editConversationMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEditedConversation);
    });

    test('should propagate error when service throws', async () => {
      // arrange
      const mockConversationId = '550e8400-e29b-41d4-a716-446655440000';
      const mockBody = {
        name: 'Updated Conversation Name',
      };

      editConversationMock.mockRejectedValue(new Error('Service unavailable'));

      // act & assert
      await expect(
        controller.editConversation(mockUser, mockConversationId, mockBody),
      ).rejects.toThrow('Service unavailable');

      expect(editConversationMock).toHaveBeenCalledWith(mockUser.sub, {
        name: mockBody.name,
        conversationId: mockConversationId,
        userId: mockUser.sub,
      });

      expect(editConversationMock).toHaveBeenCalledTimes(1);
    });
  });
});
