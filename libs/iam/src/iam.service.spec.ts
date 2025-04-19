import { Test, TestingModule } from '@nestjs/testing';
import { IAmService } from './iam.service';

describe('IAmService', () => {
  let service: IAmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IAmService],
    }).compile();

    service = module.get<IAmService>(IAmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
