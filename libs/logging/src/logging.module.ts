import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { Module } from '@nestjs/common';

@Module({
  providers: [RequestLoggerMiddleware],
  exports: [RequestLoggerMiddleware],
})
export class LoggingModule {}
