import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from 'http';
import { PinoLoggerService } from '@/libs/logging/src/pino-logger.service';
import { CORRELATION_ID_HEADER } from '@/libs/logging/src/constants';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: PinoLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const { statusCode } = res;

      const statusText = STATUS_CODES[statusCode] || 'Unknown Status';

      const correlationId = res.getHeader(CORRELATION_ID_HEADER);

      const message = `${method} ${originalUrl} ${statusCode} ${statusText}`;

      const logPayload = {
        method,
        url: originalUrl,
        statusCode,
        statusText,
        correlationId,
      } as const;

      if (statusCode >= 500) this.logger.error(logPayload, message);
      else if (statusCode >= 400) this.logger.warn(logPayload, message);
      else this.logger.info(logPayload, message);
    });

    next();
  }
}
