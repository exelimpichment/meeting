import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from './config.service';
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
