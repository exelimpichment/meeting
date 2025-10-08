import { RequestContextStorage } from '@/libs/logging/src/als.request-context';
import { CORRELATION_ID_HEADER } from '@/libs/logging/src/constants';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(private readonly storage: RequestContextStorage) {}

  use(req: Request, res: Response, next: NextFunction) {
    const incomingCorrelationId =
      (req.headers[CORRELATION_ID_HEADER] as string | undefined) ||
      req.header(CORRELATION_ID_HEADER) ||
      req.header(CORRELATION_ID_HEADER.toLowerCase());

    const correlationId = incomingCorrelationId || randomUUID();

    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    this.storage.run({ correlationId }, () => {
      next();
    });
  }
}
