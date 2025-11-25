import { MeetingApiGatewayService } from '@/apps/meeting-api-gateway/src/meeting-api-gateway.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('MeetingApiGatewayService', () => {
  let service: MeetingApiGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeetingApiGatewayService],
    }).compile();

    service = module.get(MeetingApiGatewayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('liveness', () => {
    test('should return ok status', () => {
      // act
      const result = service.liveness();

      // assert
      expect(result).toEqual({ status: 'ok' });
      expect(result.status).toBe('ok');
      expect(typeof result.status).toBe('string');
    });
  });

  describe('readiness', () => {
    test('should return ok status', () => {
      // act
      const result = service.readiness();

      // assert
      expect(result).toEqual({ status: 'ok' });
      expect(result.status).toBe('ok');
      expect(typeof result.status).toBe('string');
    });
  });
});
