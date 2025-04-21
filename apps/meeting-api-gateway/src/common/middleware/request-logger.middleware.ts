import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from 'http';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const { statusCode } = res;

      const statusText = STATUS_CODES[statusCode] || 'Unknown Status';

      if (statusCode >= 400) {
        this.logger.error(
          `${method} ${originalUrl} ${statusCode} ${statusText}`,
        );
      } else {
        this.logger.log(`${method} ${originalUrl} ${statusCode} ${statusText}`);
      }
    });

    next();
  }
}
