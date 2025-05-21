import { Test, TestingModule } from '@nestjs/testing';
import { MessengerPrismaService } from './messenger-prisma.service';

describe('PrismaService', () => {
  let service: MessengerPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessengerPrismaService],
    }).compile();

    service = module.get<MessengerPrismaService>(MessengerPrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
