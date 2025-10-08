import { DynamicModule, Global, Module } from '@nestjs/common';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { PinoLoggerService } from '@/libs/logging/src/pino-logger.service';
import { ContextMiddleware } from '@/libs/logging/src/middleware/context.middleware';
import { RequestContextStorage } from '@/libs/logging/src/als.request-context';
import { LOGGER_MODULE_OPTIONS } from '@/libs/logging/src/tokens';
import { LoggerModuleOptions } from '@/libs/logging/src/types';

@Global()
@Module({})
export class LoggingModule {
  static forRoot(options?: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggingModule,
      providers: [
        RequestContextStorage,
        ContextMiddleware,
        RequestLoggerMiddleware,
        {
          provide: PinoLoggerService,
          useFactory: (storage: RequestContextStorage) => {
            return new PinoLoggerService(storage, options);
          },
          inject: [RequestContextStorage],
        },
        {
          provide: LOGGER_MODULE_OPTIONS,
          useValue: options ?? {},
        },
      ],
      exports: [
        RequestContextStorage,
        ContextMiddleware,
        RequestLoggerMiddleware,
        PinoLoggerService,
      ],
    };
  }
}
