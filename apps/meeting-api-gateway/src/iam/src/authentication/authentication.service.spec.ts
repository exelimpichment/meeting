import { AuthenticationService } from '@/apps/meeting-api-gateway/src/iam/src/authentication/authentication.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '@/apps/meeting-api-gateway/src/iam/src/users/repositories/users.repository';
import { HashingService } from '@/libs/hashing/src';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensRepository } from '@/apps/meeting-api-gateway/src/iam/src/refresh-tokens/refresh-tokens.repository';
import { jwtConfig } from '@/libs/shared-authentication/src/configs/jwt-config';
import { ConfigType } from '@nestjs/config';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let usersRepository: {
    create: jest.Mock;
    findOneByEmail: jest.Mock;
  };
  let hashingService: {
    hash: jest.Mock;
    compare: jest.Mock;
  };

  let refreshTokensRepository: {
    create: jest.Mock;
    findByJti: jest.Mock;
    revokeById: jest.Mock;
  };

  let mockJwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };

  let jwtConfiguration: ConfigType<typeof jwtConfig>;

  beforeEach(async () => {
    const mockUsersRepository = {
      create: jest.fn(),
      findOneByEmail: jest.fn(),
    };

    const mockHashingService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: RefreshTokensRepository,
          useValue: {
            create: jest.fn(),
            findByJti: jest.fn(),
            revokeById: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            JWT_ACCESS_TOKEN_AUDIENCE: 'test-audience',
            JWT_ACCESS_TOKEN_ISSUER: 'test-issuer',
            JWT_ACCESS_TOKEN_SECRET: 'test-secret',
            JWT_ACCESS_TOKEN_TTL: 3600,

            JWT_REFRESH_TOKEN_AUDIENCE: 'test-refresh-audience',
            JWT_REFRESH_TOKEN_ISSUER: 'test-refresh-issuer',
            JWT_REFRESH_TOKEN_SECRET: 'test-refresh-secret',
            JWT_REFRESH_TOKEN_TTL: 86400,
          },
        },
      ],
    }).compile();

    service = module.get(AuthenticationService);
    usersRepository = module.get(UsersRepository);
    hashingService = module.get(HashingService);
    mockJwtService = module.get(JwtService);
    jwtConfiguration = module.get<ConfigType<typeof jwtConfig>>(jwtConfig.KEY);
    refreshTokensRepository = module.get(RefreshTokensRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const mockSignUpDto: SignUpDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    test('should successfully create a new user and return the user object', async () => {
      // arrange
      const mockHashedPassword = 'hashedPassword123';
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: mockHashedPassword,
      };

      hashingService.hash.mockResolvedValue(mockHashedPassword);
      usersRepository.create.mockResolvedValue(mockUser);

      // act
      const result = await service.signUp(mockSignUpDto);

      // assert
      expect(result).toEqual(mockUser);
      expect(hashingService.hash).toHaveBeenCalledWith(mockSignUpDto.password);
      expect(usersRepository.create).toHaveBeenCalledWith({
        email: mockSignUpDto.email,
        hashedPassword: mockHashedPassword,
      });
    });

    test('should hash the password before creating the user', async () => {
      // arrange
      const mockHashedPassword = 'hashedPassword123';
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: mockHashedPassword,
      };

      hashingService.hash.mockResolvedValue(mockHashedPassword);
      usersRepository.create.mockResolvedValue(mockUser);

      // act
      const result = await service.signUp(mockSignUpDto);

      // assert
      expect(result).toEqual(mockUser);
      expect(hashingService.hash).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith({
        email: mockSignUpDto.email,
        hashedPassword: mockHashedPassword,
      });
    });

    test('should throw an error if email is already in use', async () => {
      // arrange
      const mockHashedPassword = 'hashedPassword123';
      const prismaError = new PrismaClientKnownRequestError('P2002', {
        code: 'P2002',
        clientVersion: '6.0.0',
      });

      hashingService.hash.mockResolvedValue(mockHashedPassword);
      usersRepository.create.mockRejectedValue(prismaError);

      // act & assert
      await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
        new ConflictException('Unique constraint violation'),
      );
    });

    test('should throw an error if non-Prisma error is thrown', async () => {
      // arrange
      const error = new Error('Non-Prisma error');
      usersRepository.create.mockRejectedValue(error);

      // act & assert
      await expect(service.signUp(mockSignUpDto)).rejects.toThrow(error);
    });
  });

  describe('signIn', () => {
    test('should successfully sign in user and return access and refresh tokens', async () => {
      // arrange
      const mockSignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      const mockAccessToken = 'accessToken123';
      const mockRefreshToken = 'refreshToken123';
      const mockHashedRefreshToken = 'hashedRefreshToken123';

      mockJwtService.signAsync
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);

      hashingService.hash.mockResolvedValue(mockHashedRefreshToken);

      usersRepository.findOneByEmail.mockResolvedValue(mockUser);
      hashingService.compare.mockResolvedValue(true);

      // act
      const result = await service.signIn(mockSignInDto);

      // assert
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    test('should call usersRepository.findOneByEmail with correct email', async () => {
      // arrange
      const mockSignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      usersRepository.findOneByEmail.mockResolvedValue(mockUser);
      hashingService.compare.mockResolvedValue(true);

      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      hashingService.hash.mockResolvedValue('hashedRefreshToken');

      // act
      await service.signIn(mockSignInDto);

      // assert
      expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(
        mockSignInDto.email,
      );
    });

    test('should compare provided password with stored hashed password', async () => {
      // arrange
      const mockSignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUserDatabase = {
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      usersRepository.findOneByEmail.mockResolvedValue(mockUserDatabase);
      hashingService.compare.mockResolvedValue(true);

      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      hashingService.hash.mockResolvedValue('hashedRefreshToken');

      // act
      await service.signIn(mockSignInDto);

      // assert
      expect(hashingService.compare).toHaveBeenCalledWith(
        mockSignInDto.password,
        mockUserDatabase.password,
      );
    });

    test('should generate access token with correct payload (sub, email) and options', async () => {
      // arrange
      const mockSignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUserDatabase = {
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      usersRepository.findOneByEmail.mockResolvedValue(mockUserDatabase);
      hashingService.compare.mockResolvedValue(true);

      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      hashingService.hash.mockResolvedValue('hashedRefreshToken');

      //act
      await service.signIn(mockSignInDto);

      // assert
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: 'user-id-123',
          email: 'test@example.com',
        },
        {
          audience: jwtConfiguration.JWT_ACCESS_TOKEN_AUDIENCE,
          issuer: jwtConfiguration.JWT_ACCESS_TOKEN_ISSUER,
          secret: jwtConfiguration.JWT_ACCESS_TOKEN_SECRET,
          expiresIn: `${jwtConfiguration.JWT_ACCESS_TOKEN_TTL}s`,
        },
      );
    });

    test('should generate refresh token with correct payload (sub, email, jti) and options', async () => {
      // arrange
      const mockSignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUserDatabase = {
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      usersRepository.findOneByEmail.mockResolvedValue(mockUserDatabase);
      hashingService.compare.mockResolvedValue(true);

      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      hashingService.hash.mockResolvedValue('hashedRefreshToken');

      //act
      await service.signIn(mockSignInDto);

      // assert
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          sub: 'user-id-123',
          email: 'test@example.com',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          jti: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          ),
        }),
        {
          audience: jwtConfiguration.JWT_REFRESH_TOKEN_AUDIENCE,
          issuer: jwtConfiguration.JWT_REFRESH_TOKEN_ISSUER,
          secret: jwtConfiguration.JWT_REFRESH_TOKEN_SECRET,
          expiresIn: `${jwtConfiguration.JWT_REFRESH_TOKEN_TTL}s`,
        },
      );
    });

    test('should hash the refresh token before storing it in the database', async () => {
      // arrange
      const mockSignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUserDatabase = {
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      usersRepository.findOneByEmail.mockResolvedValue(mockUserDatabase);
      hashingService.compare.mockResolvedValue(true);

      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      hashingService.hash.mockResolvedValue('hashedRefreshToken');

      //act
      await service.signIn(mockSignInDto);

      // assert
      expect(hashingService.hash).toHaveBeenCalledTimes(1);
    });

    test('should create refresh token record in database with correct data', async () => {
      // arrange
      const mockSignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUserDatabase = {
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      const mockHashedRefreshToken = 'hashedRefreshToken123';

      usersRepository.findOneByEmail.mockResolvedValue(mockUserDatabase);
      hashingService.compare.mockResolvedValue(true);

      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      hashingService.hash.mockResolvedValue(mockHashedRefreshToken);

      // act
      await service.signIn(mockSignInDto);

      // assert
      expect(refreshTokensRepository.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        jti: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
        hashedToken: mockHashedRefreshToken,
        userId: mockUserDatabase.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expiresAt: expect.any(Date),
      });
    });

    test('should throw UnauthorizedException if user does not exist', async () => {
      // arrange
      const mockSignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersRepository.findOneByEmail.mockResolvedValue(null);

      // act & assert
      await expect(service.signIn(mockSignInDto)).rejects.toThrow(
        new UnauthorizedException('User does not exist'),
      );
    });

    test('should throw UnauthorizedException if password does not match', async () => {
      // arrange
      const mockSignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersRepository.findOneByEmail.mockResolvedValue({
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
      });

      hashingService.compare.mockResolvedValue(false);

      // act
      await expect(service.signIn(mockSignInDto)).rejects.toThrow(
        new UnauthorizedException('Password does not match'),
      );
    });
  });

  describe('logout', () => {
    test('should successfully revoke refresh token when valid token is provided', async () => {
      // arrange
      const mockRefreshToken = 'refreshToken123';

      const mockRefreshTokenPayload = {
        jti: 'refreshToken123',
      };

      const mockedRecord = {
        id: 'refreshToken123',
        jti: 'refreshToken123',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockRefreshTokenPayload);

      refreshTokensRepository.findByJti.mockResolvedValue(mockedRecord);

      // act
      await service.logout(mockRefreshToken);

      // assert
      expect(refreshTokensRepository.revokeById).toHaveBeenCalledWith(
        mockedRecord.id,
      );
    });

    test('should call jwtService.verifyAsync with correct token and options', async () => {
      // arrange
      const mockRefreshToken = 'refreshToken123';

      // act
      await service.logout(mockRefreshToken);

      // assert
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        mockRefreshToken,
        {
          secret: jwtConfiguration.JWT_REFRESH_TOKEN_SECRET,
          audience: jwtConfiguration.JWT_REFRESH_TOKEN_AUDIENCE,
          issuer: jwtConfiguration.JWT_REFRESH_TOKEN_ISSUER,
        },
      );
    });

    test('should successfully revoke refresh token when valid token is provided', async () => {
      // arrange
      const mockedRecord = {
        id: 'refreshToken123',
        jti: 'refreshToken123',
      };

      const mockRefreshToken = 'refreshToken123';

      refreshTokensRepository.findByJti.mockResolvedValue(mockedRecord);
      mockJwtService.verifyAsync.mockResolvedValue(mockedRecord);

      // act
      await service.logout(mockRefreshToken);

      // assert
      expect(refreshTokensRepository.revokeById).toHaveBeenCalledWith(
        mockedRecord.id,
      );
    });

    // test: should successfully revoke refresh token when valid token is provided
    // test: should call jwtService.verifyAsync with correct token and options
    // test: should extract jti from verified token payload
    // test: should call refreshTokensRepository.findByJti with correct jti
    // test: should call refreshTokensRepository.revokeById with correct record id when token is found
    // test: should return void when token is successfully revoked
    // test: should return void when refreshToken is undefined
    // test: should return void when refreshToken is null
    // test: should return void when jti is missing from token payload
    // test: should return void when token record is not found in database
    // test: should silently handle invalid token (catch and ignore errors)
    // test: should silently handle expired token
    // test: should silently handle malformed token
  });
});
