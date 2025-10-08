import pino, { Logger as PinoBaseLogger } from 'pino';
import { Injectable, Scope } from '@nestjs/common';
import { RequestContextStorage } from '@/libs/logging/src/als.request-context';
import { LoggerModuleOptions, LogLevel } from '@/libs/logging/src/types';
import { DEFAULT_LOG_LEVEL } from '@/libs/logging/src/constants';

@Injectable({ scope: Scope.TRANSIENT })
export class PinoLoggerService {
  private readonly baseLogger: PinoBaseLogger;

  constructor(
    private readonly storage: RequestContextStorage,
    options?: LoggerModuleOptions,
  ) {
    const level: LogLevel = options?.level ?? DEFAULT_LOG_LEVEL;
    const serviceName = options?.serviceName ?? 'app';
    const base = { service: serviceName, ...options?.base } as Record<
      string,
      unknown
    >;

    this.baseLogger = pino({
      level,
      base,
      transport: options?.prettyPrint
        ? {
            // pino pretty transport for local development readability
            target: 'pino-pretty',
            options: { colorize: true, singleLine: false },
          }
        : undefined,
    });
  }

  private childWithContext(extra?: Record<string, unknown>) {
    const ctx = this.storage.getStore();
    const correlationId = ctx?.correlationId;
    const bindings = correlationId ? { correlationId, ...extra } : { ...extra };
    return this.baseLogger.child(bindings);
  }

  fatal(obj: unknown, msg?: string) {
    this.childWithContext().fatal(obj as Record<string, unknown>, msg);
  }

  error(obj: unknown, msg?: string) {
    this.childWithContext().error(obj as Record<string, unknown>, msg);
  }

  warn(obj: unknown, msg?: string) {
    this.childWithContext().warn(obj as Record<string, unknown>, msg);
  }

  info(obj: unknown, msg?: string) {
    this.childWithContext().info(obj as Record<string, unknown>, msg);
  }

  debug(obj: unknown, msg?: string) {
    this.childWithContext().debug(obj as Record<string, unknown>, msg);
  }

  trace(obj: unknown, msg?: string) {
    this.childWithContext().trace(obj as Record<string, unknown>, msg);
  }
}
