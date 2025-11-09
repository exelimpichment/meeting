import { CONVERSATIONS_GET_PATTERN } from '@/libs/contracts/patterns/conversations/CONSTANTS';
import { ConversationsService } from '@/apps/meeting-api-gateway/src/conversations/conversations.service';
import { MEETING_API_NATS_CLIENT } from '@/apps/meeting-api-gateway/src/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { KeyvCacheService } from '@/libs/cache';
import { of, throwError } from 'rxjs';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let natsClient: jest.Mocked<ClientProxy>;
  let keyvCacheService: jest.Mocked<KeyvCacheService>;

  const userId = 'b8b3e3eb-ad07-4a04-9e86-ef6ad6069c27';
  const mockCachedConversations = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'new_name-2',
      created_at: new Date('2025-10-01 19:59:10.000'),
      updated_at: new Date('2025-10-19 10:09:19.460'),
      creator_id: null,
    },
  ];

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

    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<ConversationsService>(ConversationsService);
    natsClient = module.get(MEETING_API_NATS_CLIENT);
    keyvCacheService = module.get(KeyvCacheService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConversations', () => {
    describe('cache related scenarios', () => {
      test('should return cached conversations when cache exists (cache hit scenario)', async () => {
        // arrange: setup mocks
        const getCacheSpy = jest.spyOn(keyvCacheService, 'get');
        const setCacheSpy = jest.spyOn(keyvCacheService, 'set');
        const sendNatsSpy = jest.spyOn(natsClient, 'send');

        getCacheSpy.mockResolvedValue(mockCachedConversations);

        // act: call the method
        const result = await service.getConversations(userId);

        // assert: verify results
        expect(result).toEqual(mockCachedConversations);
        expect(getCacheSpy).toHaveBeenCalledWith(
          `user:${userId}:conversations`,
        );

        expect(getCacheSpy).toHaveBeenCalledTimes(1);

        // assert: verify NATS was NOT called (cache hit means no NATS call)
        expect(sendNatsSpy).not.toHaveBeenCalled();

        // assert: verify cache was NOT updated (we already have data)
        expect(setCacheSpy).not.toHaveBeenCalled();
      });

      test('should return conversations from NATS when cache is empty (cache miss scenario)', async () => {
        // arrange: setup mocks
        const getCacheSpy = jest.spyOn(keyvCacheService, 'get');
        const sendNatsSpy = jest.spyOn(natsClient, 'send');
        const setCacheSpy = jest.spyOn(keyvCacheService, 'set');

        getCacheSpy.mockResolvedValue(undefined);
        sendNatsSpy.mockReturnValue(of(mockCachedConversations));

        // act: call the method
        const result = await service.getConversations(userId);

        // assert: verify results
        expect(getCacheSpy).toHaveBeenCalledWith(
          `user:${userId}:conversations`,
        );

        // assert: verify cache returns undefined since cache is not there
        const cacheResult = await (getCacheSpy.mock.results[0]
          .value as Promise<undefined>);
        expect(cacheResult).toBeUndefined();

        expect(sendNatsSpy).toHaveBeenCalledWith(CONVERSATIONS_GET_PATTERN, {
          userId,
        });

        expect(setCacheSpy).toHaveBeenCalledWith(
          `user:${userId}:conversations`,
          mockCachedConversations,
          300000,
        );

        expect(result).toEqual(mockCachedConversations);
      });
    });

    test('should handle empty results from NATS', async () => {
      // arrange: cache miss, NATS returns empty array
      const getCacheSpy = jest.spyOn(keyvCacheService, 'get');
      const sendNatsSpy = jest.spyOn(natsClient, 'send');
      const setCacheSpy = jest.spyOn(keyvCacheService, 'set');

      const emptyResult = [];

      getCacheSpy.mockResolvedValue(undefined);
      sendNatsSpy.mockReturnValue(of(emptyResult));

      // act: call the method
      const result = await service.getConversations(userId);

      // assert: verify cache was called
      expect(getCacheSpy).toHaveBeenCalledWith(`user:${userId}:conversations`);
      expect(getCacheSpy).toHaveBeenCalledTimes(1);

      // assert: verify NATS was called
      expect(sendNatsSpy).toHaveBeenCalledWith(CONVERSATIONS_GET_PATTERN, {
        userId,
      });
      expect(sendNatsSpy).toHaveBeenCalledTimes(1);

      // assert: verify cache was updated
      expect(setCacheSpy).toHaveBeenCalledWith(
        `user:${userId}:conversations`,
        emptyResult,
        300000,
      );
      expect(setCacheSpy).toHaveBeenCalledTimes(1);

      expect(result).toEqual(emptyResult);
    });

    test('should propagate NATS errors when NATS client fails', async () => {
      // arrange: cache miss, NATS throws error
      const getCacheSpy = jest.spyOn(keyvCacheService, 'get');
      const sendNatsSpy = jest.spyOn(natsClient, 'send');
      const setCacheSpy = jest.spyOn(keyvCacheService, 'set');

      const NatsError = new Error('NATS connection failed');

      getCacheSpy.mockResolvedValue(undefined);
      // mock NATS to return an error Observable
      sendNatsSpy.mockReturnValue(throwError(() => NatsError));

      // act & assert: verify error is propagated
      await expect(service.getConversations(userId)).rejects.toThrow(
        'NATS connection failed',
      );

      // assert: verify cache was called
      expect(getCacheSpy).toHaveBeenCalledWith(`user:${userId}:conversations`);
      expect(getCacheSpy).toHaveBeenCalledTimes(1);

      // assert: verify NATS was called
      expect(sendNatsSpy).toHaveBeenCalledWith(CONVERSATIONS_GET_PATTERN, {
        userId,
      });
      expect(sendNatsSpy).toHaveBeenCalledTimes(1);

      // assert: verify cache was NOT updated when error occurs
      expect(setCacheSpy).not.toHaveBeenCalled();
    });

    test('should propagate cache errors when cache.get() fails', async () => {
      // arrange: cache.get() throws an error
      const getCacheSpy = jest.spyOn(keyvCacheService, 'get');
      const sendNatsSpy = jest.spyOn(natsClient, 'send');

      const cacheError = new Error('Cache service unavailable');

      getCacheSpy.mockRejectedValue(cacheError);

      // act & assert: verify error is propagated

      const result = service.getConversations(userId);

      await expect(result).rejects.toThrow('Cache service unavailable');

      // assert: verify cache was called
      expect(getCacheSpy).toHaveBeenCalledWith(`user:${userId}:conversations`);
      expect(getCacheSpy).toHaveBeenCalledTimes(1);

      // assert: verify NATS was NOT called (error happened before NATS call)
      expect(sendNatsSpy).not.toHaveBeenCalled();
    });

    test('should propagate cache errors when cache.set() fails after NATS call', async () => {
      // arrange: cache miss, NATS succeeds, but cache.set() fails
      const getCacheSpy = jest.spyOn(keyvCacheService, 'get');
      const sendNatsSpy = jest.spyOn(natsClient, 'send');
      const setCacheSpy = jest.spyOn(keyvCacheService, 'set');

      const cacheSetError = new Error('Failed to write to cache');

      getCacheSpy.mockResolvedValue(undefined);
      sendNatsSpy.mockReturnValue(of(mockCachedConversations));
      setCacheSpy.mockRejectedValue(cacheSetError);

      // act & assert: verify error is propagated
      await expect(service.getConversations(userId)).rejects.toThrow(
        'Failed to write to cache',
      );

      // assert: verify NATS was called successfully
      expect(sendNatsSpy).toHaveBeenCalledWith(CONVERSATIONS_GET_PATTERN, {
        userId,
      });

      // assert: verify cache.set() was attempted
      expect(setCacheSpy).toHaveBeenCalled();
    });
  });
});
