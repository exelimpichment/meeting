import { MEETING_API_NATS_CLIENT } from '@/apps/meeting-api-gateway/src/constants';
import { UsersService } from '@/apps/meeting-api-gateway/src/users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

describe('UsersService', () => {
  let natsClient: jest.Mocked<Pick<ClientProxy, 'send'>>;
  let service: UsersService;

  beforeEach(async () => {
    const mockNatsClient: jest.Mocked<Pick<ClientProxy, 'send'>> = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: MEETING_API_NATS_CLIENT,
          useValue: mockNatsClient,
        },
      ],
    }).compile();

    service = module.get(UsersService);
    natsClient = mockNatsClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    test('should return a user', async () => {
      const mockUser = { id: '123', name: 'Test User' };

      natsClient.send.mockReturnValue(of(mockUser));
      const user = await service.getUser(mockUser.id);

      expect(user).toEqual(mockUser);
      expect(natsClient.send).toHaveBeenCalledWith('users.findOne', {
        id: '123',
      });
    });

    test('should propagate NATS errors when NATS client fails', async () => {
      const NatsError = new Error('NATS connection failed');

      natsClient.send.mockReturnValue(throwError(() => NatsError));

      await expect(service.getUser('123')).rejects.toThrow(
        'NATS connection failed',
      );
    });
  });
});
