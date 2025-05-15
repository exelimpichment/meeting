import { Test, TestingModule } from '@nestjs/testing';
import { Messenger } from './messenger';

describe('Messenger', () => {
  let provider: Messenger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Messenger],
    }).compile();

    provider = module.get<Messenger>(Messenger);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
