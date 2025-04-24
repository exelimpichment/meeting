import { Test, TestingModule } from '@nestjs/testing';
import { MeetingApiGatewayController } from './meeting-api-gateway.controller';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';

describe('MeetingApiGatewayController', () => {
  let meetingApiGatewayController: MeetingApiGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MeetingApiGatewayController],
      providers: [MeetingApiGatewayService],
    }).compile();

    meetingApiGatewayController = app.get<MeetingApiGatewayController>(
      MeetingApiGatewayController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(meetingApiGatewayController.getHello()).toBe('Hello World!');
    });
  });
});
