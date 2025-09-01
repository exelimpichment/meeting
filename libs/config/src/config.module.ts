import { ConfigService } from '@/libs/config/src/config.service';
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigFactoryKeyHost } from '@nestjs/config';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {
  static forFeature(config: ConfigFactoryKeyHost): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: config.KEY,
          useValue: config,
        },
      ],
      exports: [config.KEY],
    };
  }
}
