import { UsersController } from '@/apps/meeting-api-gateway/src/users/users.controller';
import { UsersService } from '@/apps/meeting-api-gateway/src/users/users.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<jest.Mocked<UsersService>>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    test('should return user', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2025-11-18T23:25:08Z',
      };

      usersService.getUser.mockResolvedValue(mockUser);

      const result = await controller.getUser(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(usersService.getUser).toHaveBeenCalledWith(mockUser.id);
    });

    test('should throw error', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2025-11-18T23:25:08Z',
      };
      const mockError = new Error('User not found');

      usersService.getUser.mockRejectedValue(mockError);

      await expect(controller.getUser(mockUser.id)).rejects.toThrowError(
        'User not found',
      );
    });
  });
});
