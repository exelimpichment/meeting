import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLoggerService } from '@/libs/logging/src/pino-logger.service';
import { CORRELATION_ID_HEADER } from '@/libs/logging/src/constants';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const type = host.getType();

    if (type === 'http') {
      const ctx = host.switchToHttp();

      const req = ctx.getRequest<Request>();
      const res = ctx.getResponse<Response>();

      const status =
        exception instanceof HttpException ? exception.getStatus() : 500;

      const message =
        exception instanceof Error
          ? exception.message
          : 'internal server error';

      const path = req.originalUrl ?? req.url;
      const method = req.method;

      const correlationId =
        res.getHeader(CORRELATION_ID_HEADER) ??
        req.headers[CORRELATION_ID_HEADER];

      this.logger.error(
        {
          method,
          path,
          statusCode: status,
          message,
          correlationId,
          stack:
            process.env.NODE_ENV === 'production'
              ? undefined
              : exception instanceof Error
                ? exception.stack
                : undefined,
        },
        'unhandled http exception',
      );

      res.status(status).json({
        statusCode: status,
        message,
        path,
        correlationId,
      });
      return;
    }

    if (type === 'ws') {
      this.logger.error(
        {
          message:
            exception instanceof Error ? exception.message : 'ws exception',
        },
        'unhandled ws exception',
      );
      throw exception;
    }

    this.logger.error(
      {
        message:
          exception instanceof Error ? exception.message : 'unknown exception',
      },
      'unhandled exception',
    );
    throw exception;
  }
}
