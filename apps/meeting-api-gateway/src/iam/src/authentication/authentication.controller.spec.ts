import { AuthenticationController } from '@/apps/meeting-api-gateway/src/iam/src/authentication/authentication.controller';
import { AuthenticationService } from '@/apps/meeting-api-gateway/src/iam/src/authentication/authentication.service';
import { jwtConfig } from '@/libs/shared-authentication/src/configs/jwt-config';
import { Test, TestingModule } from '@nestjs/testing';

describe('authentication controller', () => {
  let controller: AuthenticationController;
  let mockAuthenticationService: jest.Mocked<AuthenticationService>;

  beforeEach(async () => {
    const mockAuthenticationService = {
      signIn: jest.fn(),
      signUp: jest.fn(),
      logout: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
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
  });

  describe('sign-up', () => {
    test('should sign up', () => {});
  });
});
