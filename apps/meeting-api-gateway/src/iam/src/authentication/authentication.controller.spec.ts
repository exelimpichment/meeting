import { AuthenticationController } from '@/apps/meeting-api-gateway/src/iam/src/authentication/authentication.controller';
import { AuthenticationService } from '@/apps/meeting-api-gateway/src/iam/src/authentication/authentication.service';
import { SignInDto } from '@/apps/meeting-api-gateway/src/iam/src/authentication/dto/sign-in.dto';
import { jwtConfig } from '@/libs/shared-authentication/src/configs/jwt-config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';

describe('authentication controller', () => {
  let controller: AuthenticationController;
  let mockAuthService: Pick<
    jest.Mocked<AuthenticationService>,
    'signUp' | 'signIn' | 'logout'
  >;
  const originalNodeEnv = process.env.NODE_ENV;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    password: 'test-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockAuthService = {
      signUp: jest.fn(),
      signIn: jest.fn(),
      logout: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            JWT_ACCESS_TOKEN_SECRET: 'test-secret',
            JWT_ACCESS_TOKEN_AUDIENCE: 'test-audience',
            JWT_ACCESS_TOKEN_ISSUER: 'test-issuer',
            JWT_ACCESS_TOKEN_TTL: '3600',
            JWT_REFRESH_TOKEN_SECRET: 'test-refresh-secret',
            JWT_REFRESH_TOKEN_AUDIENCE: 'test-refresh-audience',
            JWT_REFRESH_TOKEN_ISSUER: 'test-refresh-issuer',
            JWT_REFRESH_TOKEN_TTL: '86400',
          },
        },
      ],
    }).compile();

    controller = app.get(AuthenticationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('root', () => {
    test('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('sign-up', () => {
    test('should sign up', async () => {
      // arrange
      mockAuthService.signUp.mockResolvedValue(mockUser);

      // act
      const result = await controller.signUp(mockUser);

      // assert
      expect(result).toEqual(mockUser);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('signIn', () => {
    const mockSignInDto: SignInDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    let mockResponse: jest.Mocked<Response>;
    let mockCookie: jest.Mock;

    beforeEach(() => {
      mockCookie = jest.fn().mockReturnThis();

      mockResponse = {
        cookie: mockCookie,
      } as unknown as jest.Mocked<Response>;
    });

    test('should call authService.signIn and return success', async () => {
      // arrange
      mockAuthService.signIn.mockResolvedValue(mockTokens);

      // act
      const result = await controller.signIn(mockResponse, mockSignInDto);

      // assert
      expect(mockAuthService.signIn).toHaveBeenCalledWith(mockSignInDto);

      expect(mockAuthService.signIn).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });

    test('should set access_token cookie with correct config', async () => {
      // arrange
      mockAuthService.signIn.mockResolvedValue(mockTokens);
      process.env.NODE_ENV = 'development';

      // act
      await controller.signIn(mockResponse, mockSignInDto);

      // assert
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        mockTokens.accessToken,
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 3600 * 1000,
        },
      );
    });

    test('should set refresh_token cookie with correct config', async () => {
      // arrange
      mockAuthService.signIn.mockResolvedValue(mockTokens);
      process.env.NODE_ENV = 'development';

      // act
      await controller.signIn(mockResponse, mockSignInDto);

      // assert
      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        mockTokens.refreshToken,
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 86400 * 1000,
          path: '/',
        },
      );
    });

    test('should calculate maxAge from JWT_ACCESS_TOKEN_TTL', async () => {
      // arrange
      mockAuthService.signIn.mockResolvedValue(mockTokens);
      process.env.NODE_ENV = 'development';

      // act
      await controller.signIn(mockResponse, mockSignInDto);

      // assert
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        mockTokens.accessToken,
        expect.objectContaining({
          maxAge: 3600 * 1000, // 3600 seconds * 1000 = milliseconds
        }),
      );
    });

    test('should use fallback maxAge when TTL is missing', async () => {
      // arrange
      mockAuthService.signIn.mockResolvedValue(mockTokens);
      process.env.NODE_ENV = 'development';

      const appWithoutTtl: TestingModule = await Test.createTestingModule({
        controllers: [AuthenticationController],
        providers: [
          {
            provide: AuthenticationService,
            useValue: mockAuthService,
          },
          {
            provide: jwtConfig.KEY,
            useValue: {
              JWT_ACCESS_TOKEN_SECRET: 'test-secret',
              JWT_ACCESS_TOKEN_AUDIENCE: 'test-audience',
              JWT_ACCESS_TOKEN_ISSUER: 'test-issuer',
              JWT_ACCESS_TOKEN_TTL: undefined,
              JWT_REFRESH_TOKEN_SECRET: 'test-refresh-secret',
              JWT_REFRESH_TOKEN_AUDIENCE: 'test-refresh-audience',
              JWT_REFRESH_TOKEN_ISSUER: 'test-refresh-issuer',
              JWT_REFRESH_TOKEN_TTL: undefined,
            },
          },
        ],
      }).compile();

      const controllerWithoutTtl = appWithoutTtl.get(AuthenticationController);
      const mockCookieWithoutTtl = jest.fn().mockReturnThis();
      const mockResponseWithoutTtl = {
        cookie: mockCookieWithoutTtl,
      } as unknown as jest.Mocked<Response>;

      // act
      await controllerWithoutTtl.signIn(mockResponseWithoutTtl, mockSignInDto);

      // assert
      expect(mockCookieWithoutTtl).toHaveBeenCalledWith(
        'access_token',
        mockTokens.accessToken,
        expect.objectContaining({
          maxAge: 3600 * 1000, // fallback value
        }),
      );

      expect(mockCookieWithoutTtl).toHaveBeenCalledWith(
        'refresh_token',
        mockTokens.refreshToken,
        expect.objectContaining({
          maxAge: 86400 * 1000, // fallback value
        }),
      );
    });

    test('should set secure=false in development', async () => {
      // arrange
      mockAuthService.signIn.mockResolvedValue(mockTokens);
      process.env.NODE_ENV = 'development';

      // act
      await controller.signIn(mockResponse, mockSignInDto);

      // assert
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        mockTokens.accessToken,
        expect.objectContaining({
          secure: false,
        }),
      );

      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        mockTokens.refreshToken,
        expect.objectContaining({
          secure: false,
        }),
      );
    });

    test('should set secure=true in production', async () => {
      // arrange
      mockAuthService.signIn.mockResolvedValue(mockTokens);
      process.env.NODE_ENV = 'production';

      // act
      await controller.signIn(mockResponse, mockSignInDto);

      // assert
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        mockTokens.accessToken,
        expect.objectContaining({
          secure: true,
        }),
      );

      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        mockTokens.refreshToken,
        expect.objectContaining({
          secure: true,
        }),
      );
    });

    test('should propagate service errors', async () => {
      // arrange
      const serviceError = new UnauthorizedException('User does not exist');
      mockAuthService.signIn.mockRejectedValue(serviceError);

      // act & assert
      await expect(
        controller.signIn(mockResponse, mockSignInDto),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(mockSignInDto);
      expect(mockAuthService.signIn).toHaveBeenCalledTimes(1);
      expect(mockCookie).not.toHaveBeenCalled();
    });
  });
});
