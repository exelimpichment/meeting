import { MeetingApiGatewayController } from '@/apps/meeting-api-gateway/src/meeting-api-gateway.controller';
import { MeetingApiGatewayService } from '@/apps/meeting-api-gateway/src/meeting-api-gateway.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('MeetingApiGatewayController', () => {
  let controller: MeetingApiGatewayController;

  let livenessMock: jest.Mock;
  let readinessMock: jest.Mock;

  beforeEach(async () => {
    livenessMock = jest.fn();
    readinessMock = jest.fn();

    const mockService = {
      liveness: livenessMock,
      readiness: readinessMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingApiGatewayController],
      providers: [
        {
          provide: MeetingApiGatewayService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get(MeetingApiGatewayController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    test("should return the service's liveness response", () => {
      // arrange
      livenessMock.mockReturnValue({ status: 'ok' });

      // act
      const result = controller.health();

      // assert
      expect(livenessMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ status: 'ok' });
      expect(result.status).toBe('ok');
    });

    test('should propagate error when service throws', () => {
      // arrange
      const serviceError = new Error('Service unavailable');

      livenessMock.mockImplementation(() => {
        throw serviceError;
      });

      // act & assert
      expect(() => controller.health()).toThrow('Service unavailable');
      expect(livenessMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('readiness', () => {
    test("should return the service's readiness response", () => {
      // arrange
      readinessMock.mockReturnValue({ status: 'ok' });

      // act
      const result = controller.readiness();

      // assert
      expect(readinessMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ status: 'ok' });
      expect(result.status).toBe('ok');
    });

    test('should propagate error when service throws', () => {
      // arrange
      const serviceError = new Error('Service unavailable');
      readinessMock.mockImplementation(() => {
        throw serviceError;
      });

      // act & assert
      expect(() => controller.readiness()).toThrow('Service unavailable');
      expect(readinessMock).toHaveBeenCalledTimes(1);
    });
  });
});
